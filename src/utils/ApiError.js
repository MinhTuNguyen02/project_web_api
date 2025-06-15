class ApiError extends Error {
  constructor(statusCode, message) {
    // Thằng cha (Error) có property message rồi nên gọi nó luôn trong super
    super(message)

    // Tên của cái custom Error này, nếu không set thì mặc định nó sẽ kế thừa là "Error"
    this.name = 'ApiError'

    // Gán thêm http status code của ở đây
    this.statusCode = statusCode

    // Ghi lại Stack Trace để debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError