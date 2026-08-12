'use strict';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function protectDisplayMath(content) {
  return String(content || '').replace(
    /(^|\n)[ \t]*\$\$[ \t]*\n([\s\S]*?)\n[ \t]*\$\$[ \t]*(?=\n|$)/g,
    function(match, prefix, body) {
      return prefix + '<div class="math-display">\\[\n' + escapeHtml(body.trim()) + '\n\\]</div>';
    }
  );
}

hexo.extend.filter.register('before_post_render', function(data) {
  if (data && typeof data.content === 'string') {
    data.content = protectDisplayMath(data.content);
  }
  return data;
});
