/* mock deep */
import promptColor from '../cli'
import { get } from '../__mocks__/prompt'
import { equal } from 'node:assert/strict'

get.callsFake(async () => ({ color: 'Purple' }))
equal(await promptColor(), 'Purple')
equal(get.callCount, 1)
