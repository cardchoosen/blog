#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const manager = require('./lib/content-manager');
const { startServer, writePublishedSnapshot } = require('./server');

function printHelp() {
  console.log(`Hexo Post Admin

Usage:
  npm run post:import -- <article-package-or-parent> [--force]
  npm run post:list
  npm run post:delete -- <slug> [--yes]
  npm run post:admin -- [--port 4100]
  npm run post:admin:restart -- [--port 4100]
  npm run deploy

Commands:
  import    Import one article package or all packages under a parent folder
  list      List current posts from source/_posts
  delete    Move a post and its assets to .trash/posts
  server    Start the local web admin
  restart   Stop the previous local web admin on the same port, then start it
  deploy    Run hexo deploy, then update the published content snapshot
            Refuses risky empty-site deploys unless --allow-empty-site is passed
`);
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function readOption(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1 || index === args.length - 1) return fallback;
  return args[index + 1];
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: manager.PROJECT_ROOT,
      shell: false,
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', (err) => {
      console.error(err.message);
      resolve(1);
    });
    child.on('close', (code) => {
      resolve(code || 0);
    });
  });
}

function inspectPublishRisk() {
  const publicPosts = manager.listPosts().filter((post) => post.published !== false);
  const hasIndex = fs.existsSync(path.join(manager.PROJECT_ROOT, 'public/index.html'));
  const warnings = [];
  if (publicPosts.length === 0) warnings.push('当前没有公开文章：所有文章都被删除或标记为 published: false。');
  if (!hasIndex) warnings.push('构建产物缺少 public/index.html，发布后 anemone.wiki 根路径可能 404。');
  return { ok: warnings.length === 0, warnings, publicPostCount: publicPosts.length, hasIndex };
}

function listeningPids(port) {
  const result = spawnSync('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'], {
    encoding: 'utf8'
  });
  if (result.status !== 0 && !result.stdout) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((pid, index, list) => list.indexOf(pid) === index);
}

function stopServerOnPort(port) {
  const pids = listeningPids(port);
  if (!pids.length) {
    console.log(`No previous post admin process found on port ${port}.`);
    return;
  }

  pids.forEach((pid) => {
    try {
      process.kill(Number(pid), 'SIGTERM');
      console.log(`Stopped previous post admin process ${pid} on port ${port}.`);
    } catch (err) {
      throw new Error(`Failed to stop process ${pid} on port ${port}: ${err.message}`);
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (!command || command === '-h' || command === '--help') {
      printHelp();
      return;
    }

    if (command === 'import') {
      const input = args.find((arg, index) => index > 0 && !arg.startsWith('--'));
      if (!input) throw new Error('Missing input path');
      const results = manager.importInput(input, { force: hasFlag(args, '--force') });
      printJson({ imported: results });
      return;
    }

    if (command === 'list') {
      printJson({ posts: manager.listPosts() });
      return;
    }

    if (command === 'delete') {
      const slug = args.find((arg, index) => index > 0 && !arg.startsWith('--'));
      if (!slug) throw new Error('Missing slug');
      printJson(manager.deletePost(slug, { yes: hasFlag(args, '--yes') }));
      return;
    }

    if (command === 'server') {
      const port = Number(readOption(args, '--port', process.env.POST_ADMIN_PORT || 4100));
      await startServer({ port });
      return;
    }

    if (command === 'restart') {
      const port = Number(readOption(args, '--port', process.env.POST_ADMIN_PORT || 4100));
      stopServerOnPort(port);
      await startServer({ port });
      return;
    }

    if (command === 'deploy') {
      const risk = inspectPublishRisk();
      if (!risk.ok && !hasFlag(args, '--allow-empty-site')) {
        console.error('ERROR: 发布保护已阻止 deploy。');
        risk.warnings.forEach((warning) => console.error(`- ${warning}`));
        console.error('如果确认要发布空站点，请执行：npm run deploy -- --allow-empty-site');
        process.exitCode = 1;
        return;
      }
      const hexoBin = path.join(manager.PROJECT_ROOT, 'node_modules/.bin/hexo');
      const code = await runCommand(hexoBin, ['deploy']);
      if (code !== 0) {
        process.exitCode = code;
        return;
      }
      const snapshot = writePublishedSnapshot();
      console.log(`Published content snapshot updated: ${snapshot.publishedAt}`);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exitCode = 1;
  }
}

main();
