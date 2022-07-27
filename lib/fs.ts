import { writeFileSync } from 'fs'
// import { join } from 'node:path'

/**
 * Uses `fs` to create a file.
 */
const createFile = (): void => {
  // writeFileSync(join(process.cwd(), 'file.txt'), 'Hi')
  writeFileSync('file.txt', 'Hi')
}

export default createFile
