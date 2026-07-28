const { writePublishedSnapshot } = require('../tools/post-admin/server');

hexo.on('deployAfter', function () {
  const snapshot = writePublishedSnapshot();
  hexo.log.info(`Published content snapshot updated: ${snapshot.publishedAt}`);
});
