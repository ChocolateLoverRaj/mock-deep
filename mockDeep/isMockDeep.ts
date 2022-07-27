import Config from './Config'

const isMockDeep = (
  {
    mockParam,
    mockParamDeep
  }: Pick<Config, 'mockParam' | 'mockParamDeep'>,
  queryWithQuestionMark: string
): boolean => {
  if (queryWithQuestionMark === '') return false
  const params = new URLSearchParams(queryWithQuestionMark.slice(1))
  return params.get(mockParam) === mockParamDeep
}

export default isMockDeep
