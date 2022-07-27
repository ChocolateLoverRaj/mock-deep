import { RuleSetRule } from 'webpack'
import Config from '../Config'
import defaultConfig from '../defaultConfig'
import isMockDeep from '../isMockDeep'

const getMockDeepLoaderRule = (
  {
    mockParam,
    mockParamDeep,
    mockParamThisOrDeep
  }: Pick<Config, 'mockParam' | 'mockParamDeep' | 'mockParamThisOrDeep'> = defaultConfig
): RuleSetRule => ({
  loader: require.resolve('./mockDeepLoader'),
  resourceQuery: query => isMockDeep({ mockParam, mockParamDeep }, query),
  options: { mockParam, mockParamThisOrDeep }
})

export default getMockDeepLoaderRule
