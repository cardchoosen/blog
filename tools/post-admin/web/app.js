const output = document.querySelector('#output');
let cachedPosts = [];
let cachedCategories = [];

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

function optionalNumber(value) {
  const text = String(value == null ? '' : value).trim();
  return text === '' ? '' : Number(text);
}

function seriesOrderText(post) {
  return post.series_order === undefined || post.series_order === null || post.series_order === ''
    ? ''
    : ` / order ${escapeHtml(post.series_order)}`;
}

function setDefaultDate() {
  const input = document.querySelector('#date');
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  input.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

async function loadPosts() {
  const data = await api('/api/posts');
  cachedPosts = data.posts || [];
  const list = document.querySelector('#post-list');
  renderEditList(cachedPosts);
  renderDeleteList(cachedPosts);
  if (!cachedPosts.length) {
    list.innerHTML = '<div class="post-row"><div class="post-meta">暂无文章</div></div>';
    return;
  }
  list.innerHTML = cachedPosts.map((post) => `
    <div class="post-row">
      <div class="post-meta">${post.date || '-'}</div>
      <div>
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-meta">${escapeHtml(post.categories.join(', '))} / ${escapeHtml(post.tags.join(', '))}</div>
      </div>
      <div class="post-meta">${escapeHtml(post.slug)}${seriesOrderText(post)}</div>
    </div>
  `).join('');
}

async function loadCategories() {
  const data = await api('/api/categories');
  cachedCategories = data.categories || [];
  renderCategoryList(cachedCategories);
}

function renderCategoryList(categories) {
  const list = document.querySelector('#category-list');
  if (!list) return;
  if (!categories.length) {
    list.innerHTML = '<div class="category-empty">暂无分类</div>';
    return;
  }

  list.innerHTML = categories.map((category) => `
    <div class="category-row">
      <div>
        <div class="post-title">${escapeHtml(category.name)}</div>
        <div class="post-meta">${category.count} 篇文章</div>
      </div>
      <button class="ghost use-category-item" type="button" data-name="${escapeHtml(category.name)}">选择</button>
    </div>
  `).join('');
}

function renderEditList(posts) {
  const list = document.querySelector('#edit-list');
  if (!list) return;
  if (!posts.length) {
    list.innerHTML = '<div class="edit-empty">暂无可修改文章</div>';
    return;
  }

  list.innerHTML = posts.map((post) => `
    <div class="edit-row">
      <div>
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-meta">${escapeHtml(post.date || '-')} / ${escapeHtml(post.slug)}${seriesOrderText(post)}</div>
        <div class="post-meta">${escapeHtml(post.categories.join(', '))} / ${escapeHtml(post.tags.join(', '))}</div>
      </div>
      <button class="ghost load-edit-item" type="button" data-slug="${escapeHtml(post.slug)}">修改</button>
    </div>
  `).join('');
}

function renderDeleteList(posts) {
  const list = document.querySelector('#delete-list');
  if (!list) return;
  if (!posts.length) {
    list.innerHTML = '<div class="delete-empty">暂无可删除文章</div>';
    return;
  }

  list.innerHTML = posts.map((post) => `
    <div class="delete-row">
      <div>
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-meta">${escapeHtml(post.date || '-')} / ${escapeHtml(post.slug)}${seriesOrderText(post)}</div>
        <div class="post-meta">${escapeHtml(post.categories.join(', '))} / ${escapeHtml(post.tags.join(', '))}</div>
      </div>
      <div class="delete-actions">
        <button class="ghost preview-delete-item" type="button" data-slug="${escapeHtml(post.slug)}">清单</button>
        <button class="danger run-delete-item" type="button" data-slug="${escapeHtml(post.slug)}">删除</button>
      </div>
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

document.querySelector('#refresh-delete-posts').addEventListener('click', async () => {
  try {
    await loadPosts();
    show('删除列表已刷新');
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#refresh-edit-posts').addEventListener('click', async () => {
  try {
    await loadPosts();
    show('修改列表已刷新');
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#refresh-categories').addEventListener('click', async () => {
  try {
    await loadCategories();
    show('分类列表已刷新');
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
        series_order: optionalNumber(document.querySelector('#series-order').value),
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

async function loadEditPost(slug) {
  const data = await api(`/api/post?slug=${encodeURIComponent(slug)}`);
  const post = data.post;
  document.querySelector('#edit-form').hidden = false;
  document.querySelector('#edit-title').value = post.title || '';
  document.querySelector('#edit-slug').value = post.slug || '';
  document.querySelector('#edit-date').value = post.date || '';
  document.querySelector('#edit-series-order').value = post.series_order === undefined || post.series_order === null ? '' : post.series_order;
  document.querySelector('#edit-categories').value = (post.categories || []).join(', ');
  document.querySelector('#edit-tags').value = (post.tags || []).join(', ');
  document.querySelector('#edit-excerpt').value = post.excerpt || '';
  document.querySelector('#edit-body').value = post.body || '';
}

document.querySelector('#edit-list').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-slug]');
  if (!button) return;

  try {
    await loadEditPost(button.dataset.slug);
    show(`已加载文章：${button.dataset.slug}`);
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#update-post').addEventListener('click', async () => {
  const slug = document.querySelector('#edit-slug').value;
  if (!slug) {
    show('ERROR: 请先选择一篇文章');
    return;
  }

  try {
    const data = await api('/api/update', {
      method: 'POST',
      body: {
        slug,
        title: document.querySelector('#edit-title').value,
        date: document.querySelector('#edit-date').value,
        categories: splitList(document.querySelector('#edit-categories').value),
        tags: splitList(document.querySelector('#edit-tags').value),
        series_order: optionalNumber(document.querySelector('#edit-series-order').value),
        excerpt: document.querySelector('#edit-excerpt').value,
        body: document.querySelector('#edit-body').value
      }
    });
    show(data);
    await loadPosts();
    await loadWorktree();
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#category-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-name]');
  if (!button) return;
  document.querySelector('#category-old-name').value = button.dataset.name;
  document.querySelector('#category-new-name').focus();
});

document.querySelector('#preview-category-rename').addEventListener('click', async () => {
  try {
    const data = await api('/api/category/rename', {
      method: 'POST',
      body: {
        oldName: document.querySelector('#category-old-name').value,
        newName: document.querySelector('#category-new-name').value,
        yes: false
      }
    });
    show(data);
  } catch (err) {
    show(`ERROR: ${err.message}`);
  }
});

document.querySelector('#run-category-rename').addEventListener('click', async () => {
  const oldName = document.querySelector('#category-old-name').value;
  const newName = document.querySelector('#category-new-name').value;
  if (!window.confirm(`确认把分类 "${oldName}" 重命名为 "${newName}" 吗？`)) return;

  try {
    const data = await api('/api/category/rename', {
      method: 'POST',
      body: { oldName, newName, yes: true }
    });
    show(data);
    await loadPosts();
    await loadCategories();
    await loadWorktree();
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

document.querySelector('#delete-list').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-slug]');
  if (!button) return;
  const slug = button.dataset.slug;

  try {
    if (button.classList.contains('preview-delete-item')) {
      document.querySelector('#delete-slug').value = slug;
      const data = await api('/api/delete', {
        method: 'POST',
        body: { slug, yes: false }
      });
      show(data);
      return;
    }

    if (button.classList.contains('run-delete-item')) {
      if (!window.confirm(`确认把 ${slug} 移动到回收站？`)) return;
      const data = await api('/api/delete', {
        method: 'POST',
        body: { slug, yes: true }
      });
      show(data);
      await loadPosts();
      await loadWorktree();
    }
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
loadCategories().catch(() => {});
loadWorktree().catch(() => {});
