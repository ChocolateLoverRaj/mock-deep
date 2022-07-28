import { basename, dirname, isAbsolute, join, resolve } from 'path'
import { NodePath, transformFileAsync } from '@babel/core'
import {
  arrayPattern,
  ImportDeclaration,
  arrayExpression,
  Identifier,
  variableDeclaration,
  VariableDeclarator,
  variableDeclarator,
  isImportDefaultSpecifier,
  ImportDefaultSpecifier
} from '@babel/types'
import never from 'never'
import { statements as template, expression } from '@babel/template'
import { fileURLToPath } from 'url'

const buildImportMockOrDeep = template(`
  import IDENTIFIER from '${join(dirname(fileURLToPath(import.meta.url)), './importMockOrDeep.js')
    .replaceAll(/\\/g, '/')}'
`)

const buildPromiseAll = template(`
  const VAR_ARR = Promise.all(IMPORTS_ARR)
`)

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
      plugins: [{
        visitor: {
          // ImportDeclaration: path => {
          //   const deepImportPath = path.node.source.value
          //   if (importedHelper === undefined) {
          //     importedHelper = path.scope.generateUidIdentifier('importMockOrDeep')
          //     path.insertBefore(buildImportMockOrDeep({ IDENTIFIER: importedHelper.name }))
          //   }
          // },
          Program: path => {
            const importDeclarations: ImportDeclaration[] = []
            path.traverse({
              ImportDeclaration: path => {
                importDeclarations.push(path.node)
              }
            })
            const identifier = path.scope.generateUidIdentifier('importMockOrDeep')
            const mockedIdentifiers: Identifier[] = []
            path.unshiftContainer('body', [
              ...buildImportMockOrDeep({ IDENTIFIER: identifier.name }),
              ...buildPromiseAll({
                VAR_ARR: arrayPattern(importDeclarations.map(node => {
                  const mockedIdentifier =
                    path.scope.generateUidIdentifier(`mocked_${node.source.value}`)
                  mockedIdentifiers.set(node, mockedIdentifier)
                  return mockedIdentifier
                })),
                IMPORTS_ARR: arrayExpression(importDeclarations.map(node =>
                  expression.ast(`${identifier.name}('${node.source.value}')`)))
              })
            ])
            path.traverse({
              ImportDeclaration: path => {
                const variableDeclarators: VariableDeclarator[] = []
                console.log(mockedIdentifiers, path.node)
                const init = mockedIdentifiers.get(path.node) ?? never()
                const importDefaultSpecifier = path.node.specifiers.find(
                  node => isImportDefaultSpecifier(node)) as ImportDefaultSpecifier | undefined
                if (importDefaultSpecifier !== undefined) {
                  variableDeclarators.push(variableDeclarator(importDefaultSpecifier.local, init))
                }
                path.replaceWith(variableDeclaration('const', variableDeclarators))
              }
            })
          }
        }
      }]
    }) ?? never()
    console.log(code)
    throw new Error('stop')
  } else {
    // A node.js module we can't deep mock
    return await import(importPath)
  }
}

export default importMockDeep
