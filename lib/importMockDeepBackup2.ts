import { basename, dirname, isAbsolute, join, resolve } from 'path'
import { NodePath, PluginObj, transformFileAsync, Visitor } from '@babel/core'
import {
  arrayPattern,
  ImportDeclaration,
  arrayExpression,
  Identifier,
  variableDeclaration,
  VariableDeclarator,
  variableDeclarator,
  isImportDefaultSpecifier,
  ImportDefaultSpecifier,
  importDeclaration,
  importDefaultSpecifier,
  stringLiteral
} from '@babel/types'
import never from 'never'
import { fileURLToPath } from 'url'

interface State {
  helperIdentifier?: Identifier
}
const importMockOrDeepPath = join(dirname(fileURLToPath(import.meta.url)), './importMockOrDeep.js')
  .replaceAll(/\\/g, '/')

const plugin: PluginObj<State> = {
  visitor: {
    ImportDeclaration: {
      enter: (path, state) => {
        // Do not go through our own import declaration
        if (path.node.source.value === importMockOrDeepPath) return

        if (state.helperIdentifier === undefined) {
          state.helperIdentifier = path.scope.generateUidIdentifier('importMockOrDeep')
        }
        {
          const helperIdentifier = state.helperIdentifier
          const variableDeclarators: VariableDeclarator[] = []
          const importDefaultSpecifier = path.node.specifiers.find(
            node => isImportDefaultSpecifier(node)) as ImportDefaultSpecifier | undefined
          if (importDefaultSpecifier !== undefined) {
            variableDeclarators.push(
              variableDeclarator(importDefaultSpecifier.local, helperIdentifier))
          }
          // TODO: Other specifiers
          path.replaceWith(variableDeclaration('const', variableDeclarators))
        }
      }
    },
    Program: {
      exit: (path, state) => {
        if (state.helperIdentifier !== undefined) {
          path.unshiftContainer('body', importDeclaration(
            [importDefaultSpecifier(state.helperIdentifier)],
            stringLiteral(importMockOrDeepPath)))
        }
        path.stop()
      }
    }
  }
}

const importMockDeep = async (
  importMetaUrl: string,
  importPath: string,
  mocksDir: string
): Promise<any> => {
  const importingFileDir = dirname(fileURLToPath(importMetaUrl))
  if (importPath.startsWith('.')) {
    importPath = resolve(importingFileDir, importPath)
  }
  if (isAbsolute(importPath)) {
    // A js file we can deep mock
    const { code } = await transformFileAsync(importPath, {
      compact: false,
      plugins: [plugin]
    }) ?? never()
    console.log(code)
    process.exit(1)
  } else {
    // A node.js module we can't deep mock
    return await import(importPath)
  }
}

export default importMockDeep
