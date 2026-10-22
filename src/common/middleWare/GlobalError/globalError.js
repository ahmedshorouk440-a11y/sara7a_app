
export const handler = (err, req, res, next) => {
  const { status = 500, ...extra } = err.cause || {};
  res.status(status).json({
    message: err.message,
    ...(Object.keys(extra).length && { extra }),
  });
};