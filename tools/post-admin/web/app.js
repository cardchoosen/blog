const output = document.querySelector('#output');

function show(value) {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'content-type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function setDefaultDate() {
  const input = document.querySelector('#date');
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  input.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

async function loadPosts() {
  const data = await api('/api/posts');
  const list = document.querySelector('#post-list');
  if (!data.posts.length) {
    list.innerHTML = '<div class="post-row"><div class="post-meta">暂无文章</div></div>';
    return;
  }
  list.innerHTML = data.posts.map((post) => `
    <div class="post-row">
      <div class="post-meta">${post.date || '-'}</div>
      <div>
        <div class="post-title">${post.title}</div>
        <div class="post-meta">${post.categories.join(', ')} / ${post.tags.join(', ')}</div>
      </div>
      <div class="post-meta">${post.slug}</div>
    </div>
  `).join('');
}

async function loadWorktree() {
  const data = await api('/api/worktree');
  renderChanges(data.changes || []);
  document.querySelector('#worktree-stat').textContent = data.stat || '暂无统计';
  document.querySelector('#worktree-diff').textContent = data.diff || '暂无新增文章预览';
  if (data.errors && data.errors.length) show({ errors: data.errors });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusLabel(status) {
  if (status === 'added') return '+';
  if (status === 'deleted') return '-';
  if (status === 'renamed') return 'R';
  return 'M';
}

function renderChanges(changes) {
  const target = document.querySelector('#content-changes');
  if (!changes.length) {
    target.innerHTML = '<div class="change-empty">暂无博客内容变更</div>';
    return;
  }

  target.innerHTML = changes.map((item) => {
    const additions = item.additions ? `<span class="change-add">+${item.additions}</span>` : '';
    const deletions = item.deletions ? `<span class="change-delete">-${item.deletions}</span>` : '';
    const binary = item.binary ? '<span class="change-binary">binary</span>' : '';
    return `
      <div class="change-row">
        <div>
          <div class="change-dir">${escapeHtml(item.dir)}</div>
          <div class="change-name">${escapeHtml(item.name)}</div>
        </div>
        <div class="change-meta">
          <span class="change-status ${escapeHtml(item.status)}">${statusLabel(item.status)}</span>
          ${binary}
          ${additions}
          ${deletions}
        </div>
      </div>
    `;
  }).join('');
}

function formatCommandResults(data) {
  return data.results.map((item) => {
    const parts = [
      `$ ${item.command}`,
      `exit code: ${item.code}`
    ];
    if (item.stdout) parts.push(item.stdout.trimEnd());
    if (item.stderr) parts.push(item.stderr.trimEnd());
    return parts.join('\n');
  }).join('\n\n');
}

document.querySelectorAll('.nav-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-button').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector(`#panel-${button.dataset.panel}`).classList.add('active');
  });
});

document.querySelector('#refresh-posts').addEventListener('click', async () => {
  try {
    await loadPosts();
    show('文章列表已刷新');
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#run-import').addEventListener('click', async () => {
  try {
    const data = await api('/api/import', {
      method: 'POST',
      body: {
        path: document.querySelector('#import-path').value,
        force: document.querySelector('#import-force').checked
      }
    });
    show(data);
    await loadPosts();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#create-post').addEventListener('click', async () => {
  try {
    const data = await api('/api/create', {
      method: 'POST',
      body: {
        title: document.querySelector('#title').value,
        slug: document.querySelector('#slug').value,
        date: document.querySelector('#date').value,
        categories: splitList(document.querySelector('#categories').value),
        tags: splitList(document.querySelector('#tags').value),
        excerpt: document.querySelector('#excerpt').value,
        body: document.querySelector('#body').value,
        force: document.querySelector('#create-force').checked
      }
    });
    show(data);
    await loadPosts();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#preview-delete').addEventListener('click', async () => {
  try {
    const data = await api('/api/delete', {
      method: 'POST',
      body: {
        slug: document.querySelector('#delete-slug').value,
        yes: false
      }
    });
    show(data);
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#run-delete').addEventListener('click', async () => {
  const slug = document.querySelector('#delete-slug').value;
  if (!window.confirm(`确认把 ${slug} 移动到回收站？`)) return;
  try {
    const data = await api('/api/delete', {
      method: 'POST',
      body: { slug, yes: true }
    });
    show(data);
    await loadPosts();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#refresh-worktree').addEventListener('click', async () => {
  try {
    await loadWorktree();
    show('差异已刷新');
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#run-build').addEventListener('click', async () => {
  try {
    show('正在构建...');
    const data = await api('/api/build', { method: 'POST', body: {} });
    show(formatCommandResults(data));
    await loadWorktree();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#run-publish').addEventListener('click', async () => {
  if (!window.confirm('确认执行 clean + build + deploy，并发布到 anemone.wiki 吗？')) return;
  try {
    show('正在发布，请等待命令完成...');
    const data = await api('/api/publish', { method: 'POST', body: {} });
    show(formatCommandResults(data));
    await loadWorktree();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

setDefaultDate();
loadPosts().catch((err) => show(`ERROR: ${err.message}`));
loadWorktree().catch(() => {});
