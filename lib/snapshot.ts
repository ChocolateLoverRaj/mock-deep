import { basename, join, dirname } from 'path'
import {} from 'jsonfile'

const snapshot = (fileName: string, actual: unknown): void => {
  const state = new SnapshotState(join(dirname(fileName), '../__snapshots__', basename(fileName)), {
    updateSnapshot: 'new'
  } as any)

  const result = toMatchSnapshot.call({
    snapshotState: state,
    currentTestName: basename(fileName)
  } as any, actual) as {
    pass: boolean
    message: () => string
  }

  if (!result.pass) {
    throw new Error(result.message())
  }
}

export default snapshot
