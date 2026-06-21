// Mirrors FastAPI's HTTPException: carries an HTTP status + a `detail` message.
// The global error handler turns this into a { detail } JSON body, which is the
// exact shape the frontend's api.js already expects.
export class HttpError extends Error {
  constructor(status, detail) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}
