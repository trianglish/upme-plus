export const tryCatch = async (func, errorHandler) => {
  try {
    return await func()
  } catch (err) {
    console.error('Error in tryCatch block', err)
    return errorHandler(err)
  }
}
