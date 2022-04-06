import promptColor from '../cli'
import { start, get } from '../__mocks__/prompt'

afterEach(() => {
  start.mockReset()
  get.mockReset()
})

test('returns prompt answer', async () => {
  get.mockImplementation(async () => ({ color: 'Purple' }))
  await expect(promptColor()).resolves.toBe('Purple')
  expect(get.mock.calls.length).toBe(1)
})
