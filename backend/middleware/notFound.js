export const notFound = (req, res, next) => {
  // Skip favicon.ico requests to avoid unnecessary error logs
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};