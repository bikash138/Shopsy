// Operational error carrying an HTTP status code, thrown from services
// and translated to a response by the global error handler.
export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
