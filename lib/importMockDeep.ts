import { dirname, isAbsolute, join, resolve } from 'path'
import { PluginObj, transformFileAsync } from '@babel/core'
import {
  arrayPattern,
  ImportDeclaration,
  arrayExpression,
  variableDeclaration,
  VariableDeclarator,
  variableDeclarator,
  isImportDefaultSpecifier,
  ImportDefaultSpecifier,
  importDeclaration,
  importDefaultSpecifier,
  stringLiteral,
  isImportDeclaration,
  callExpression,
  memberExpression,
  identifier,
  awaitExpression,
  metaProperty
} from '@babel/types'
import never from 'never'
import { fileURLToPath, pathToFileURL } from 'url'
import { Blob } from 'buffer'
const importMockOrDeepPath = pathToFileURL(
  join(dirname(fileURLToPath(import.meta.url)), './importMockOrDeep.js')
    .replaceAll(/\\/g, '/')).toString()

const plugin: PluginObj = {
  visitor: {
    Program: (path, state) => {
      // Skip files without imports
      const importDeclarations = path.node.body.filter(node =>
        isImportDeclaration(node)) as ImportDeclaration[]
      if (importDeclarations.length === 0) return

      // Import the function importMockOrDeep
      const helperIdentifier = path.scope.generateUidIdentifier('importMockOrDeep')

      // The var names of the mocked modules
      const mockedIdentifiers = importDeclarations.map(({ source: { value } }) =>
        path.scope.generateUidIdentifier(`mocked__${value}`))

      // Replace imports with const vars
      importDeclarations.forEach((node, index) => {
        const variableDeclarators: VariableDeclarator[] = []
        const importDefaultSpecifier = node.specifiers.find(
          node => isImportDefaultSpecifier(node)) as ImportDefaultSpecifier | undefined
        if (importDefaultSpecifier !== undefined) {
          variableDeclarators.push(
            variableDeclarator(importDefaultSpecifier.local, mockedIdentifiers[index]))
        }
        // TODO: Other specifiers

        path.node.body[path.node.body.indexOf(node)] =
          variableDeclaration('const', variableDeclarators)
      })

      // Save mocksDir in a variable for performance
      const mocksDirIdentifier = path.scope.generateUidIdentifier('mocksDir')
      const { mocksDir } = state.opts as { mocksDir: string }
      path.node.body.unshift(
        // Import importMockOrDeep
        importDeclaration(
          [importDefaultSpecifier(helperIdentifier)],
          stringLiteral(importMockOrDeepPath)),

        // Set mocksDir
        variableDeclaration('const', [
          variableDeclarator(mocksDirIdentifier, stringLiteral(mocksDir))
        ]),

        // Call importMockOrDeep
        variableDeclaration('const', [
          variableDeclarator(
            arrayPattern(mockedIdentifiers),
            awaitExpression(callExpression(
              memberExpression(identifier('Promise'), identifier('all')),
              [arrayExpression(importDeclarations.map(node =>
                callExpression(helperIdentifier, [
                  // memberExpression(metaProperty(identifier('import'), identifier('meta')),
                  //   identifier('url')),
                  // node.source,
                  // mocksDirIdentifier
                ])))])))
        ]))
    }
  }
}

const importMockDeep = async (
  importMetaUrl: string,
  importPath: string,
  mocksDir: string
): Promise<any> => {
  console.log(importPath)
  const importingFileDir = dirname(fileURLToPath(importMetaUrl))
  if (importPath.startsWith('.')) {
    importPath = resolve(importingFileDir, importPath)
  }
  if (isAbsolute(importPath)) {
    // A js file we can deep mock
    const { code } = await transformFileAsync(importPath, {
      compact: true,
      plugins: [[plugin, { mocksDir }]]
    }) ?? never()
    return await import(URL.createObjectURL(new Blob([code ?? never()], { type: 'text/javascript' }) as any))
    // return await import(`data:text/javascript,${code ?? never()}`)
  } else {
    // A node.js module we can't deep mock
    return await import(importPath)
  }
}

export default importMockDeep
