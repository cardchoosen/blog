#!/usr/bin/env node

const manager = require('./lib/content-manager');
const { startServer } = require('./server');

function printHelp() {
  console.log(`Hexo Post Admin

Usage:
  npm run post:import -- <article-package-or-parent> [--force]
  npm run post:list
  npm run post:delete -- <slug> [--yes]
  npm run post:admin -- [--port 4100]

Commands:
  import    Import one article package or all packages under a parent folder
  list      List current posts from source/_posts
  delete    Move a post and its assets to .trash/posts
  server    Start the local web admin
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

    throw new Error(`Unknown command: ${command}`);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exitCode = 1;
  }
}

main();
