import { LoaderContext } from 'webpack'
import { transformAsync } from '@babel/core'
import never from 'never'
import CommentToQueryLoaderOptions from './CommentToQueryLoaderOptions'

function mockDeepLoader (
  this: LoaderContext<CommentToQueryLoaderOptions>,
  source: string,
  sourceMap: any
): void {
  const callback = this.async()
  ;(async (): Promise<any[]> => {
    const { mockParam, mockParamDeep, mockDeepComment } = this.getOptions()
    const { code, map } = await transformAsync(source, {
      inputSourceMap: sourceMap,
      plugins: [{
        visitor: {
          ImportDeclaration: path => {
            if ((path.node.leadingComments ?? [])
              .some(({ type, value }) => type === 'CommentBlock' && value === mockDeepComment)) {
              const questionMarkIndex = path.node.source.value.indexOf('?')
              const params = questionMarkIndex !== -1
                ? new URLSearchParams(path.node.source.value.slice(questionMarkIndex + 1))
                : new URLSearchParams()
              params.set(mockParam, mockParamDeep)
              const pathWithoutParams = questionMarkIndex !== -1
                ? path.node.source.value.slice(0, questionMarkIndex)
                : path.node.source.value
              path.node.source.value = `${pathWithoutParams}?${params.toString()}`
            }
          }
        }
      }],
      sourceMaps: this.sourceMap,
      compact: true
    }) ?? never()
    return [code ?? never(), map ?? undefined]
  })()
    .then(
      result => callback(null, ...result),
      err => callback(err))
}

export default mockDeepLoader
