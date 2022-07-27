import Config from '../Config'

interface CommentToQueryLoaderOptions extends Pick<Config, 'mockParam' | 'mockParamDeep'> {
  /**
   * Remember that the comment
   * ```
   * star/ comment /star
   * ```
   * is `<space>comment<space>`
   */
  mockDeepComment: string
}

export default CommentToQueryLoaderOptions
