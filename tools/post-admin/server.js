const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { URL } = require('url');
const manager = require('./lib/content-manager');

const PUBLIC_DIR = path.join(__dirname, 'web');
const CONTENT_PATHS = ['source/_posts', 'source/images/posts', 'source/files/posts'];
const SNAPSHOT_PATH = path.join(manager.PROJECT_ROOT, '.tmp/post-admin/published-content.json');

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJson(res, status, body) {
  send(res, status, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify(body, null, 2));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: manager.PROJECT_ROOT,
      shell: false,
      env: process.env
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (err) => {
      resolve({ command: [command].concat(args).join(' '), code: 1, stdout, stderr: stderr + err.message });
    });
    child.on('close', (code) => {
      resolve({
        command: [command].concat(args).join(' '),
        code,
        stdout,
        stderr,
        ok: code === 0 || Boolean(options.allowFailure)
      });
    });
  });
}

async function runSequence(steps) {
  const results = [];
  for (const step of steps) {
    const result = await runCommand(step[0], step.slice(1));
    results.push(result);
    if (result.code !== 0) break;
  }
  return results;
}

async function readWorktreeStatus() {
  const current = createContentSnapshot();
  const previous = readPublishedSnapshot();
  const changes = compareContentSnapshots(previous, current);
  const diff = buildMarkdownPreview(changes, previous, current);

  return {
    status: changes.map((item) => `${statusLabel(item.status)} ${item.path}`).join('\n'),
    stat: formatContentStat(changes),
    diff,
    changes,
    baseline: previous ? previous.publishedAt : null,
    errors: []
  };
}

function statusLabel(status) {
  if (status === 'added') return 'A';
  if (status === 'deleted') return 'D';
  return 'M';
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function walkContentFiles() {
  const files = [];
  function walk(dir) {
    const fullDir = path.join(manager.PROJECT_ROOT, dir);
    if (!fs.existsSync(fullDir)) return;
    fs.readdirSync(fullDir, { withFileTypes: true }).forEach((entry) => {
      const relPath = path.join(dir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) walk(relPath);
      else if (entry.isFile()) files.push(relPath);
    });
  }
  CONTENT_PATHS.forEach(walk);
  return files.sort();
}

function isTextFile(relPath) {
  return ['.md', '.txt', '.json', '.yml', '.yaml'].includes(path.extname(relPath).toLowerCase());
}

function readText(relPath) {
  return fs.readFileSync(path.join(manager.PROJECT_ROOT, relPath), 'utf8');
}

function createContentSnapshot() {
  const files = {};
  walkContentFiles().forEach((relPath) => {
    const fullPath = path.join(manager.PROJECT_ROOT, relPath);
    const buffer = fs.readFileSync(fullPath);
    const text = isTextFile(relPath);
    files[relPath] = {
      hash: crypto.createHash('sha256').update(buffer).digest('hex'),
      size: buffer.length,
      binary: !text,
      lines: text ? buffer.toString('utf8').split(/\r?\n/).length : 0,
      content: text ? buffer.toString('utf8') : undefined
    };
  });
  return {
    publishedAt: new Date().toISOString(),
    files
  };
}

function readPublishedSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  } catch (err) {
    return null;
  }
}

function writePublishedSnapshot(snapshot = createContentSnapshot()) {
  ensureParent(SNAPSHOT_PATH);
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}

function compareContentSnapshots(previous, current) {
  if (!previous) {
    return Object.entries(current.files).map(([relPath, file]) => createChange(relPath, 'added', null, file));
  }

  const paths = new Set(Object.keys(previous.files).concat(Object.keys(current.files)));
  return Array.from(paths).sort().map((relPath) => {
    const before = previous.files[relPath];
    const after = current.files[relPath];
    if (!before && after) return createChange(relPath, 'added', before, after);
    if (before && !after) return createChange(relPath, 'deleted', before, after);
    if (before && after && before.hash !== after.hash) return createChange(relPath, 'modified', before, after);
    return null;
  }).filter(Boolean);
}

function createChange(relPath, status, before, after) {
  const binary = Boolean((after || before).binary);
  const counts = countLineChange(before, after, binary);
  return {
    path: relPath,
    dir: path.dirname(relPath),
    name: path.basename(relPath),
    status,
    additions: counts.additions,
    deletions: counts.deletions,
    binary
  };
}

function countLineChange(before, after, binary) {
  if (binary) return { additions: 0, deletions: 0 };
  if (!before && after) return { additions: after.lines, deletions: 0 };
  if (before && !after) return { additions: 0, deletions: before.lines };
  if (!before || !after) return { additions: 0, deletions: 0 };

  const beforeLines = (before.content || '').split(/\r?\n/);
  const afterLines = (after.content || '').split(/\r?\n/);
  const beforeSet = new Map();
  beforeLines.forEach((line) => beforeSet.set(line, (beforeSet.get(line) || 0) + 1));
  let shared = 0;
  afterLines.forEach((line) => {
    const count = beforeSet.get(line) || 0;
    if (count > 0) {
      shared += 1;
      beforeSet.set(line, count - 1);
    }
  });

  return {
    additions: Math.max(0, afterLines.length - shared),
    deletions: Math.max(0, beforeLines.length - shared)
  };
}

function formatContentStat(changes) {
  if (!changes.length) return '';
  const files = changes.length;
  const additions = changes.reduce((sum, item) => sum + item.additions, 0);
  const deletions = changes.reduce((sum, item) => sum + item.deletions, 0);
  return `${files} file${files === 1 ? '' : 's'} changed, ${additions} insertions(+), ${deletions} deletions(-)`;
}

function buildMarkdownPreview(changes, previous, current) {
  return changes
    .filter((item) => item.path.startsWith('source/_posts/') && item.path.endsWith('.md'))
    .map((item) => {
      const before = previous && previous.files[item.path];
      const after = current.files[item.path];
      if (item.status === 'deleted') {
        return `deleted: ${item.path}`;
      }
      if (!after) return '';
      const lines = readText(item.path).split(/\r?\n/).map((line) => `+${line}`).join('\n');
      const header = before ? `modified: ${item.path}` : `added: ${item.path}`;
      return `${header}\n@@\n${lines}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function serveStatic(res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    send(res, 404, { 'content-type': 'text/plain; charset=utf-8' }, 'Not found');
    return;
  }
  send(res, 200, { 'content-type': contentType(filePath) }, fs.readFileSync(filePath));
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method === 'GET' && pathname === '/api/posts') {
      sendJson(res, 200, { posts: manager.listPosts() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/import') {
      const body = await readJson(req);
      const imported = manager.importInput(body.path, { force: Boolean(body.force) });
      sendJson(res, 200, { imported });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/create') {
      const body = await readJson(req);
      const packageDir = manager.createPackageFromFields(body);
      const imported = manager.importInput(packageDir, { force: Boolean(body.force) });
      sendJson(res, 200, { imported });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/delete') {
      const body = await readJson(req);
      const result = manager.deletePost(body.slug, { yes: Boolean(body.yes) });
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/worktree') {
      sendJson(res, 200, await readWorktreeStatus());
      return;
    }

    if (req.method === 'POST' && pathname === '/api/build') {
      sendJson(res, 200, { results: await runSequence([['npm', 'run', 'build']]) });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/publish') {
      const results = await runSequence([
        ['npm', 'run', 'clean'],
        ['npm', 'run', 'build'],
        ['npm', 'run', 'deploy']
      ]);
      const ok = results.every((item) => item.code === 0);
      const snapshot = ok ? writePublishedSnapshot() : null;
      sendJson(res, 200, {
        results,
        publishedSnapshot: snapshot ? snapshot.publishedAt : null
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/mark-published') {
      const snapshot = writePublishedSnapshot();
      sendJson(res, 200, { publishedSnapshot: snapshot.publishedAt });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
}

function startServer(options = {}) {
  const port = Number(options.port || 4100);
  const host = '127.0.0.1';

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${host}:${port}`);
    if (url.pathname.startsWith('/api/')) {
      handleApi(req, res, url.pathname);
      return;
    }
    serveStatic(res, url.pathname);
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, host, () => {
      console.log(`Post admin running at http://${host}:${port}/`);
      resolve(server);
    });
  });
}

module.exports = { startServer };
