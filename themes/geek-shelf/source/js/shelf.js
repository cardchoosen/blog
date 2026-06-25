// geek-shelf · 左侧书架手风琴交互（原生 JS）
(function () {
  'use strict';

  function norm(path) {
    return path && path.length > 1 && path.charAt(path.length - 1) === '/'
      ? path.slice(0, -1) : path;
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    var buttons = document.querySelectorAll('.shelf-cat');
    if (!buttons.length) return;

    var currentPath = norm(window.location.pathname);

    // 进入文章页时自动展开当前分类
    var openedItem = null;
    document.querySelectorAll('.shelf-item').forEach(function (item) {
      item.querySelectorAll('.post-link').forEach(function (link) {
        if (norm(link.getAttribute('href')) === currentPath) {
          link.classList.add('current');
          openedItem = item;
        }
      });
    });

    if (openedItem) {
      var posts = openedItem.querySelector('.shelf-posts');
      var btn = openedItem.querySelector('.shelf-cat');
      if (posts) posts.classList.add('open');
      if (btn) btn.classList.add('active');
    }

    // 手风琴：一次只展开一个
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.parentElement;
        var posts = item.querySelector('.shelf-posts');
        if (!posts) return;

        var willOpen = !posts.classList.contains('open');

        document.querySelectorAll('.shelf-posts.open').forEach(function (el) {
          if (el !== posts) el.classList.remove('open');
        });
        document.querySelectorAll('.shelf-cat.active').forEach(function (el) {
          if (el !== btn) el.classList.remove('active');
        });

        posts.classList.toggle('open', willOpen);
        btn.classList.toggle('active', willOpen);
      });
    });
  });
})();
