import { ResolvePluginInstance } from 'webpack'
import { promisify } from 'util'
import { basename, dirname, join } from 'path'
import Config from './Config'
import defaultConfig from './defaultConfig'

// FIXME: Don't use a resolve plugin, directly change imports instead
/**
 * Replaces paths that end with `?mock` with the mocked file, if there is a mocked file
 * @param rootDir The dir which has the `__mocks__` dir for mocking modules like `fs`
 * @returns A resolve plugin which you need to put in `resolve.plugins` array
 */
const getResolveMockResolvePlugin = (
  rootDir: string,
  { mockParam, mockParamDeep, mockParamThisOrDeep, mocksDir }: Config = defaultConfig
): ResolvePluginInstance => ({
  apply: resolver => {
    resolver.hooks.resolve.tapPromise('Mock', async (request, resolveContext): Promise<any> => {
      const requestPath = request.request
      console.log(requestPath)

      // Idk why requestPath can be undefined. Ignore undefined request path
      if (requestPath === undefined) return

      // Look for query param for mock
      const questionMarkIndex = requestPath.indexOf('?')
      if (questionMarkIndex === -1) return
      const queryString = requestPath.slice(questionMarkIndex + 1)
      const params = new URLSearchParams(queryString)
      if (params.get(mockParam) !== mockParamThisOrDeep) return

      // Remove mock param and convert back to string
      params.delete(mockParam)
      const paramsString = params.toString()
      const requestPathWithoutParams = requestPath.slice(0, questionMarkIndex)
      const requestPathWithoutMockParam =
        requestPathWithoutParams +
        // Do not leave a '?' and the end because it causes problems
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        (paramsString && `?${paramsString}`)

      // Promisify
      const doResolve = (promisify(resolver.doResolve) as (...params: any[]) => Promise<any>)
        .bind(resolver)
      // Helper method
      const doResolveWithRequestPath = async (requestPath: string): Promise<any> => await doResolve(
        resolver.hooks.resolve,
        {
          ...request,
          request: requestPath
        },
        undefined,
        resolveContext)

      const nodePrefix = 'node:'
      const resolvedMock = await doResolveWithRequestPath(
        resolver.isModule(requestPathWithoutMockParam)
          // All modules are expected to be in rootDir/__mocks__
          ? join(
            rootDir,
            mocksDir,
            // For `node:fs` don't try to find `__mocks__/node:fs`, try to find `__mocks__/fs`
            requestPathWithoutMockParam.startsWith(nodePrefix)
              ? requestPathWithoutMockParam.slice(nodePrefix.length)
              : requestPathWithoutMockParam)
          // Replace file with mock file in __mocks__
          : join(
            dirname(requestPathWithoutMockParam),
            mocksDir,
            basename(requestPathWithoutMockParam)))
      console.log('Resolved', requestPath)
      if (resolvedMock !== undefined) return resolvedMock

      // Mock file doesn't exist
      // Let the loader deep mock the imports of the normally resolved file
      // Switch mock type to deep, so loader changes imports
      // node:dependency is external so do not mock deep
      if (!requestPathWithoutParams.startsWith(nodePrefix)) {
        params.set(mockParam, mockParamDeep)
      }
      console.log(`${requestPathWithoutParams}?${params.toString()}`, await doResolveWithRequestPath(`${requestPathWithoutParams}?${params.toString()}`))
      return await doResolveWithRequestPath(`${requestPathWithoutParams}?${params.toString()}`)
    })
  }
})

export default getResolveMockResolvePlugin
