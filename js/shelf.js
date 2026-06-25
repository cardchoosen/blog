// geek-shelf · 左侧书架手风琴交互 + 主题切换（原生 JS）
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // 展开状态持久化键
  var STORAGE_KEY = 'shelf-opened';

  function loadOpened() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }

  function saveOpened(set) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }

  onReady(function () {
    // ---- 书架手风琴 ----
    // 注意：当前文章所在分类的 active/open 已由 EJS 模板在服务端渲染时加上
    // JS 只负责恢复 localStorage 持久化的其他展开分类 + 点击交互
    var buttons = document.querySelectorAll('.shelf-cat');
    if (buttons.length) {
      var openedCats = new Set(loadOpened() || []);

      // 恢复 localStorage 持久化的展开分类（不覆盖 EJS 已加的 active/open）
      document.querySelectorAll('.shelf-item').forEach(function (item) {
        var cat = item.getAttribute('data-cat');
        if (cat && openedCats.has(cat)) {
          var posts = item.querySelector('.shelf-posts');
          var btn = item.querySelector('.shelf-cat');
          if (posts) posts.classList.add('open');
          if (btn) btn.classList.add('active');
        }
      });

      // 把当前文章所在分类（EJS 已加 active 的）也持久化
      document.querySelectorAll('.shelf-item').forEach(function (item) {
        var btn = item.querySelector('.shelf-cat.active');
        if (btn) {
          var cat = item.getAttribute('data-cat');
          if (cat) openedCats.add(cat);
        }
      });
      saveOpened(openedCats);

      // 点击切换自己展开/收起，不影响其他（允许多开），并持久化
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.parentElement;
          var posts = item.querySelector('.shelf-posts');
          if (!posts) return;

          var willOpen = !posts.classList.contains('open');
          posts.classList.toggle('open', willOpen);
          btn.classList.toggle('active', willOpen);

          var cat = item.getAttribute('data-cat');
          if (cat) {
            if (willOpen) openedCats.add(cat);
            else openedCats.delete(cat);
            saveOpened(openedCats);
          }
        });
      });
    }

    // ---- 主题切换 ----
    var toggle = document.querySelector('.theme-toggle');
    function applyHljsTheme(theme) {
      // 启用时 media 设为 'all'，禁用时设为 'not all'
      // 不要带 prefers-color-scheme 条件，否则手动切换主题时
      // 系统偏好可能与用户选择相反，导致启用方不匹配
      document.querySelectorAll('.hljs-theme-light').forEach(function (el) {
        el.media = (theme === 'light') ? 'all' : 'not all';
      });
      document.querySelectorAll('.hljs-theme-dark').forEach(function (el) {
        el.media = (theme === 'dark') ? 'all' : 'not all';
      });
    }
    var html = document.documentElement;
    var initialTheme = html.classList.contains('theme-dark') ? 'dark' : 'light';
    applyHljsTheme(initialTheme);

    if (toggle) {
      toggle.addEventListener('click', function () {
        var isDark = html.classList.contains('theme-dark');
        var next = isDark ? 'light' : 'dark';
        html.className = 'theme-' + next;
        applyHljsTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) {}
      });
    }
  });
})();
