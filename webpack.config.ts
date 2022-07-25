import { Configuration } from 'webpack'
import glob from 'glob'
import { promisify } from 'util'
import { join, basename, extname, dirname } from 'path'
import mockResolvePlugin from './mockResolvePlugin'

const config: Configuration = {
  entry: async () => Object.fromEntries((await promisify(glob)('__tests__/*.@(ts|js)', {
    cwd: 'lib'
  }))
    // .map(path => join(__dirname, path))
    .map(path => [path, {
      import: join(__dirname, 'lib', path),
      filename: `${dirname(path)}/${basename(path, extname(path))}.js`
    }])),
  output: {
    path: join(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    extensions: ['.js', '.ts'],
    plugins: [mockResolvePlugin]
  },
  module: {
    rules: [{
      test: /.ts/,
      exclude: /node_modules/,
      loader: 'ts-loader'
    }]
  },
  target: 'node',
  mode: 'none',
  devtool: 'source-map',
  externals: {
    fs: 'require("memfs")'
  },
  experiments: {
    topLevelAwait: true
  }
}

export default config
