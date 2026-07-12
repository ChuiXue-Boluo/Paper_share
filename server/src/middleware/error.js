function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFoundHandler(req, _res, next) {
  next(createHttpError(404, `接口不存在: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    code: status,
    data: null,
    message: err.message || '服务器内部错误'
  });
}

module.exports = { asyncHandler, createHttpError, errorHandler, notFoundHandler };
