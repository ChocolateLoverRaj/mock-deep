import { writeFile } from 'jsonfile'
import { join } from 'path'

/**
 * Creates a file, but doesn't directly import `fs`. It imports `jsonfile`, which imports `fs`.
 */
const createFile = async (): Promise<void> => {
  await writeFile(join(process.cwd(), 'file.json'), {
    what: 'Sample JSON File',
    whySnapshotTesting:
      "In this example it doesn't make sense to do snapshot testing." +
      'This is snapshot tested as an example.'
  })
}

export default createFile
