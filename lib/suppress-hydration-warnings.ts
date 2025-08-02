// Suppress hydration warnings in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && (
        args[0].includes('Warning: Text content did not match') ||
        args[0].includes('Warning: Expected server HTML') ||
        args[0].includes('Hydration failed') ||
        args[0].includes('server rendered text didn\'t match') ||
        args[0].includes('fdprocessedid')
      )
    ) {
      return
    }
    originalError(...args)
  }
}
