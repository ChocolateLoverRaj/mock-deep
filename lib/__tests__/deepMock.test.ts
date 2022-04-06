import createFile from '../deepMock'
import { readFileSync } from 'fs'

test('file contents as expected', async () => {
  process.cwd = jest.fn(() => '/')
  await createFile()
  expect(readFileSync('/file.json', 'utf8')).toMatchSnapshot()
})
