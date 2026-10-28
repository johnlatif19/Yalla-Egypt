import { ValidationError } from './validate.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'not_found', message: 'The requested resource was not found.' }
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  if (err.status && err.code) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    error: { code: 'server_error', message: 'Something went wrong. Please try again later.' }
  });
}