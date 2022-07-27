import { LoaderContext } from 'webpack'
import { transformAsync } from '@babel/core'
import Config from '../Config'
import never from 'never'

function mockDeepLoader (
  this: LoaderContext<Pick<Config, 'mockParam' | 'mockParamThisOrDeep'>>,
  source: string,
  sourceMap: any
): void {
  const callback = this.async()
  ;(async (): Promise<any[]> => {
    const { mockParam, mockParamThisOrDeep } = this.getOptions()
    const { code, map } = await transformAsync(source, {
      inputSourceMap: sourceMap,
      plugins: [{
        visitor: {
          ImportDeclaration: path => {
            const questionMarkIndex = path.node.source.value.indexOf('?')
            const params = questionMarkIndex !== -1
              ? new URLSearchParams(path.node.source.value.slice(questionMarkIndex + 1))
              : new URLSearchParams()
            params.set(mockParam, mockParamThisOrDeep)
            const pathWithoutParams = questionMarkIndex !== -1
              ? path.node.source.value.slice(0, questionMarkIndex)
              : path.node.source.value
            path.node.source.value = `${pathWithoutParams}?${params.toString()}`
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
