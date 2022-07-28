import prompt from 'prompt'

const promptColor = async (): Promise<string> => {
  prompt.start()
  const { color } = await prompt.get(['color'])
  return color as string
}

export default promptColor
