/**
 * Centralized API Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ API Error [${req.method} ${req.url}]:`, err.stack || err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
};

module.exports = errorHandler;
