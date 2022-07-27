interface Config {
  mockParam: string
  /**
   * Try importing the mocked file.
   * If it doesn't exist, import the normal file but mock it's imports.
   */
  mockParamThisOrDeep: string
  /**
   * Import the normal file but mock it's imports.
   */
  mockParamDeep: string
  mocksDir: string
}

export default Config
