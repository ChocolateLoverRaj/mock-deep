import { start, get } from 'prompt'

const promptColor = async (): Promise<string> => {
  start()
  const { color } = await get(['color'])
  return color as string
}

export default promptColor
