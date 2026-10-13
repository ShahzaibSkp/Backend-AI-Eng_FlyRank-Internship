export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(error, _request, response, _next) {
  if (error.name === "SyntaxError") {
    return response.status(400).json({ error: "Malformed JSON request body" });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return response.status(status).json({
    error: error.message || "Internal server error",
    ...(error.details ? { details: error.details } : {})
  });
}
