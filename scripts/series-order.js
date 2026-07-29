function hasSeriesOrder(post) {
  if (!post) return false;
  if (post.series_order === undefined || post.series_order === null || post.series_order === '') return false;
  return Number.isFinite(Number(post.series_order));
}

function postTime(post) {
  if (!post || !post.date) return 0;
  if (typeof post.date.valueOf === 'function') return post.date.valueOf();
  return new Date(post.date).getTime() || 0;
}

hexo.extend.helper.register('sort_series_posts', function (posts) {
  const list = posts && typeof posts.toArray === 'function' ? posts.toArray() : Array.from(posts || []);
  return list.sort((a, b) => {
    const aHasOrder = hasSeriesOrder(a);
    const bHasOrder = hasSeriesOrder(b);

    if (aHasOrder && bHasOrder) {
      const orderDiff = Number(a.series_order) - Number(b.series_order);
      if (orderDiff !== 0) return orderDiff;
    } else if (aHasOrder) {
      return -1;
    } else if (bHasOrder) {
      return 1;
    }

    const dateDiff = postTime(b) - postTime(a);
    if (dateDiff !== 0) return dateDiff;
    return String(a.title || a.slug || '').localeCompare(String(b.title || b.slug || ''));
  });
});
