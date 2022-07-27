import { Configuration } from 'webpack'
import glob from 'glob'
import { promisify } from 'util'
import { join, basename, extname, dirname } from 'path'
import getResolveMockResolvePlugin from './mockDeep/getResolveMockResolvePlugin'
import getMockDeepLoaderRule from './mockDeep/importMocks/getMockDeepLoaderRule'
import getCommentToQueryRule from './mockDeep/commentToQuery/getCommentToQueryRule'

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
    extensions: ['.cjs', '.js', '.ts'],
    plugins: [getResolveMockResolvePlugin(join(__dirname, 'lib'))]
  },
  module: {
    rules: [
      getCommentToQueryRule(),
      getMockDeepLoaderRule(),
      {
        test: /\.ts/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }]
  },
  target: 'node',
  mode: 'none',
  devtool: 'source-map',
  experiments: {
    topLevelAwait: true
  }
}

export default config
