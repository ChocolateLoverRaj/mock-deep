import { RuleSetRule } from 'webpack'
import isMockDeep from '../isMockDeep'
import CommentToQueryLoaderOptions from './CommentToQueryLoaderOptions'
import defaultOptions from './defaultOptions'

/**
 * Transforms
 * ```js
 * // mock deep (but in star quotes comment)
 * import './someFile'
 * ```
 * to
 * ```js
 * import './someFile?mock=deep'
 * ```
 */
const getCommentToQueryRule = (
  {
    mockParam,
    mockParamDeep,
    mockDeepComment
  }: CommentToQueryLoaderOptions = defaultOptions
): RuleSetRule => ({
  loader: require.resolve('./commentToQueryLoader'),
  resourceQuery: query => !isMockDeep({ mockParam, mockParamDeep }, query),
  options: { mockParam, mockParamDeep, mockDeepComment }
})

export default getCommentToQueryRule
