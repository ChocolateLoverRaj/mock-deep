const { join, relative } = require('path/posix')

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    join(
      'lib',
      relative('dist', testPath.replace('__tests__', '__snapshots__'))
    ) + snapshotExtension,

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    join(
      'dist',
      relative('lib', snapshotFilePath
        .replace('__snapshots__', '__tests__')
        .slice(0, -snapshotExtension.length))
    ),

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: 'dist/__tests__/example.test.js'
}
