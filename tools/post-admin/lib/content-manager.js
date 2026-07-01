const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'source/_posts');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'source/images/posts');
const FILES_DIR = path.join(PROJECT_ROOT, 'source/files/posts');
const TRASH_DIR = path.join(PROJECT_ROOT, '.trash/posts');

const IMAGE_EXTS = new Set([
  '.apng',
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp'
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function normalizeSlug(slug) {
  return String(slug || '').trim();
}

function validateSlug(slug) {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}

function parseScalar(raw) {
  const value = raw.trim();
  if (!value) return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => parseScalar(item));
  }
  return value;
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('post.md must start with YAML front-matter delimited by ---');
  }

  const data = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(arrayItem[1]));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!kv) {
      throw new Error(`Unsupported front-matter line: ${line}`);
    }

    currentKey = kv[1];
    const rawValue = kv[2] || '';
    data[currentKey] = rawValue.trim() ? parseScalar(rawValue) : [];
  }

  return { data, body: match[2] };
}

function quoteYaml(value) {
  const text = String(value == null ? '' : value);
  if (/^[A-Za-z0-9_\-./: ]+$/.test(text) && !text.includes('#')) return text;
  return JSON.stringify(text);
}

function formatArray(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((item) => `  - ${quoteYaml(item)}`).join('\n');
}

function formatFrontMatter(data) {
  const lines = [
    '---',
    `title: ${quoteYaml(data.title)}`,
    `slug: ${quoteYaml(data.slug)}`,
    `date: ${quoteYaml(data.date)}`,
    'categories:',
    formatArray(data.categories),
    'tags:',
    formatArray(data.tags)
  ];

  if (data.excerpt) lines.push(`excerpt: ${quoteYaml(data.excerpt)}`);
  if (data.description) lines.push(`description: ${quoteYaml(data.description)}`);
  if (data.keywords) {
    lines.push('keywords:');
    lines.push(formatArray(data.keywords));
  }
  lines.push('---');
  return lines.filter((line) => line !== '').join('\n');
}

function validatePostData(data, sourceLabel) {
  const errors = [];
  const slug = normalizeSlug(data.slug);

  if (!data.title || !String(data.title).trim()) errors.push('title is required');
  if (!slug) errors.push('slug is required');
  else if (!validateSlug(slug)) errors.push('slug must use lowercase letters, numbers, and hyphens');
  if (!data.date || !String(data.date).trim()) errors.push('date is required');
  if (!Array.isArray(data.categories) || data.categories.length === 0) errors.push('categories must contain at least one item');
  if (!Array.isArray(data.tags) || data.tags.length === 0) errors.push('tags must contain at least one item');

  if (errors.length) {
    throw new Error(`${sourceLabel}: ${errors.join('; ')}`);
  }

  return {
    ...data,
    slug,
    title: String(data.title).trim(),
    date: String(data.date).trim(),
    categories: data.categories.map((item) => String(item).trim()).filter(Boolean),
    tags: data.tags.map((item) => String(item).trim()).filter(Boolean)
  };
}

function walkFiles(dir) {
  if (!isDirectory(dir)) return [];
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(fullPath));
    else if (entry.isFile()) out.push(fullPath);
  }
  return out;
}

function normalizeAssetRef(ref) {
  const clean = ref.replace(/\\/g, '/').replace(/^\.?\//, '');
  if (!clean.startsWith('assets/')) return null;
  const rel = clean.slice('assets/'.length);
  if (!rel || rel.split('/').includes('..')) {
    throw new Error(`Invalid asset path: ${ref}`);
  }
  return rel;
}

function assetTarget(slug, relPath) {
  const ext = path.extname(relPath).toLowerCase();
  const isImage = IMAGE_EXTS.has(ext);
  const baseDir = isImage ? path.join(IMAGES_DIR, slug) : path.join(FILES_DIR, slug);
  const publicBase = isImage ? `/images/posts/${slug}` : `/files/posts/${slug}`;
  return {
    dest: path.join(baseDir, relPath),
    publicPath: `${publicBase}/${relPath.replace(/\\/g, '/')}`,
    type: isImage ? 'image' : 'file'
  };
}

function copyAssets(packageDir, slug, force) {
  const assetsDir = path.join(packageDir, 'assets');
  const copied = [];
  if (!isDirectory(assetsDir)) return copied;

  for (const sourcePath of walkFiles(assetsDir)) {
    const relPath = path.relative(assetsDir, sourcePath);
    const target = assetTarget(slug, relPath);
    if (isFile(target.dest) && !force) {
      throw new Error(`Asset already exists: ${path.relative(PROJECT_ROOT, target.dest)}. Use --force to overwrite.`);
    }
    ensureDir(path.dirname(target.dest));
    fs.copyFileSync(sourcePath, target.dest);
    copied.push({
      source: path.relative(packageDir, sourcePath),
      dest: path.relative(PROJECT_ROOT, target.dest),
      publicPath: target.publicPath,
      type: target.type
    });
  }

  return copied;
}

function rewriteAssetLinks(body, slug) {
  return body.replace(/(\]\(|src=["'])(\.?\/?assets\/[^)"'\s]+)([^)"']*)(["']?)/g, (full, prefix, rawRef, suffix, quote) => {
    const relPath = normalizeAssetRef(rawRef);
    const target = assetTarget(slug, relPath);
    return `${prefix}${target.publicPath}${suffix}${quote || ''}`;
  });
}

function findPackages(inputPath) {
  const abs = path.resolve(PROJECT_ROOT, inputPath);
  if (isFile(abs) && path.basename(abs) === 'post.md') return [path.dirname(abs)];
  if (!isDirectory(abs)) throw new Error(`Input path does not exist: ${inputPath}`);
  if (isFile(path.join(abs, 'post.md'))) return [abs];

  return fs.readdirSync(abs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(abs, entry.name))
    .filter((dir) => isFile(path.join(dir, 'post.md')));
}

function importPackage(packageDir, options = {}) {
  const postPath = path.join(packageDir, 'post.md');
  if (!isFile(postPath)) throw new Error(`Missing post.md in ${packageDir}`);

  const markdown = fs.readFileSync(postPath, 'utf8');
  const parsed = parseFrontMatter(markdown);
  const data = validatePostData(parsed.data, path.relative(PROJECT_ROOT, postPath));
  const slug = data.slug;
  const targetPostPath = path.join(POSTS_DIR, `${slug}.md`);
  const imageDir = path.join(IMAGES_DIR, slug);
  const fileDir = path.join(FILES_DIR, slug);

  const conflicts = [targetPostPath, imageDir, fileDir].filter((target) => isFile(target) || isDirectory(target));
  if (conflicts.length && !options.force) {
    throw new Error(`Post "${slug}" already exists. Use --force to overwrite.`);
  }

  if (options.force) {
    for (const target of conflicts) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }

  ensureDir(POSTS_DIR);
  const copiedAssets = copyAssets(packageDir, slug, Boolean(options.force));
  const body = rewriteAssetLinks(parsed.body.trimEnd(), slug);
  const outputMarkdown = `${formatFrontMatter(data)}\n\n${body}\n`;

  fs.writeFileSync(targetPostPath, outputMarkdown, 'utf8');

  return {
    slug,
    title: data.title,
    post: path.relative(PROJECT_ROOT, targetPostPath),
    assets: copiedAssets
  };
}

function importInput(inputPath, options = {}) {
  const packages = findPackages(inputPath);
  if (!packages.length) {
    throw new Error(`No article packages found under ${inputPath}`);
  }

  const results = [];
  for (const packageDir of packages) {
    results.push(importPackage(packageDir, options));
  }
  return results;
}

function readPost(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontMatter(markdown);
  const slug = path.basename(filePath, '.md');
  return {
    slug,
    title: parsed.data.title || slug,
    date: parsed.data.date || '',
    categories: Array.isArray(parsed.data.categories) ? parsed.data.categories : [],
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
    path: path.relative(PROJECT_ROOT, filePath)
  };
}

function listPosts() {
  if (!isDirectory(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => readPost(path.join(POSTS_DIR, name)))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    '-',
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds())
  ].join('');
}

function deletePlan(slug) {
  const cleanSlug = normalizeSlug(slug);
  if (!validateSlug(cleanSlug)) throw new Error('Invalid slug');

  const targets = [
    path.join(POSTS_DIR, `${cleanSlug}.md`),
    path.join(IMAGES_DIR, cleanSlug),
    path.join(FILES_DIR, cleanSlug)
  ].filter((target) => isFile(target) || isDirectory(target));

  return {
    slug: cleanSlug,
    targets: targets.map((target) => path.relative(PROJECT_ROOT, target))
  };
}

function deletePost(slug, options = {}) {
  const plan = deletePlan(slug);
  if (!plan.targets.length) throw new Error(`Post "${plan.slug}" was not found`);

  if (!options.yes) {
    return {
      ...plan,
      deleted: false,
      message: 'Dry run only. Re-run with --yes to move these files to trash.'
    };
  }

  const trashBase = path.join(TRASH_DIR, `${plan.slug}-${timestamp()}`);
  ensureDir(trashBase);

  const moved = [];
  for (const relTarget of plan.targets) {
    const source = path.join(PROJECT_ROOT, relTarget);
    const dest = path.join(trashBase, relTarget);
    ensureDir(path.dirname(dest));
    fs.renameSync(source, dest);
    moved.push({
      from: relTarget,
      to: path.relative(PROJECT_ROOT, dest)
    });
  }

  return {
    slug: plan.slug,
    deleted: true,
    trash: path.relative(PROJECT_ROOT, trashBase),
    moved
  };
}

function createPackageFromFields(fields) {
  const data = validatePostData({
    title: fields.title,
    slug: fields.slug,
    date: fields.date,
    categories: fields.categories,
    tags: fields.tags,
    excerpt: fields.excerpt
  }, 'web form');

  const tempDir = path.join(PROJECT_ROOT, '.tmp/post-admin', `${data.slug}-${timestamp()}`);
  ensureDir(tempDir);
  const markdown = `${formatFrontMatter(data)}\n\n${String(fields.body || '').trimEnd()}\n`;
  fs.writeFileSync(path.join(tempDir, 'post.md'), markdown, 'utf8');
  return tempDir;
}

module.exports = {
  PROJECT_ROOT,
  importInput,
  listPosts,
  deletePlan,
  deletePost,
  createPackageFromFields
};
