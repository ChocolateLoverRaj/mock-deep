import { get } from '../__mocks__/prompt.js'
import { equal } from 'node:assert/strict'
import importMockDeep from '../importMockDeep.js'
const promptColor = await importMockDeep(
  import.meta.url,
  '../cli.js',
  'C:/users/rajas/documents/github/mock-deep/lib')

get.callsFake(async () => ({ color: 'Purple' }))
equal(await promptColor(), 'Purple')
equal(get.callCount, 1)
