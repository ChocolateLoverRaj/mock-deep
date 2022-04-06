import { ResolvePluginInstance } from 'webpack'
import never from 'never'
import { promisify } from 'util'
import { isAbsolute, join } from 'path'

const rootDir = join(__dirname, 'lib')

const mockResolvePlugin: ResolvePluginInstance = {
  apply: resolver => {
    resolver.hooks.resolve.tapPromise('Mock', async (request, resolveContext) => {
      const path = request.request ?? never()
      if (isAbsolute(path)) return

      if (path.startsWith('.')) return
      console.log(path)

      const mockPath = join(rootDir, '__mocks__', path)
      const resolvedPath = await (async () => {
        let resolvedPath: string
        try {
          resolvedPath = await promisify(resolver.resolve).call(
            resolver,
            {},
            request.path as string,
            mockPath,
            resolveContext) as string
        } catch (e) {
          return
        }
        return resolvedPath
      })()
      if (resolvedPath !== undefined) {
        return await (promisify(resolver.doResolve) as (...params: any[]) => Promise<any>)(
          resolver.ensureHook('resolve'),
          {
            ...request,
            request: mockPath
          },
          undefined,
          resolveContext)
      }
    })
  }
}

export default mockResolvePlugin
