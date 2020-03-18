const through2 = require('through2');
const conventionalChangelog = require('conventional-changelog')

function streamToString (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
  }

module.exports = (tagPrefix, preset, currentVersion, releaseCount) => new Promise((resolve) => {
    const stream = through2();
    const changelogStream = conventionalChangelog({
        preset,
        releaseCount,
        },
        {
        version: currentVersion,
        currentTag: `${tagPrefix}${currentVersion}`,
        tagPrefix,
        },
    )

    changelogStream
        .pipe(stream)
        .on('finish', () => resolve(streamToString(stream)))
})