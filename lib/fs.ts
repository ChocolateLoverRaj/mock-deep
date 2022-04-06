import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Creates a file, but doesn't directly import `fs`. It imports `jsonfile`, which imports `fs`.
 */
const createFile = (): void => {
  writeFileSync(join(process.cwd(), 'file.txt'), 'Hi')
}

export default createFile
