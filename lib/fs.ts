import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Uses `fs` to create a file.
 */
const createFile = (): void => {
  writeFileSync(join(process.cwd(), 'file.txt'), 'Hi')
}

export default createFile
