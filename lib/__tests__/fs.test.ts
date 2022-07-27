/* mock deep */
import createFile from '../fs'
import { readFileSync } from '../__mocks__/fs.cjs'
import { fake } from 'sinon'
import { equal } from 'node:assert/strict'

process.cwd = fake.returns('/')
createFile()
equal(readFileSync('/file.txt', 'utf8'), 'Hi')
