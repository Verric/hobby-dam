export class NotFoundError extends Error {
  errorCode = 404;
  constructor(msg: string) {
    super(msg);
    this.name = "NotFoundError";
  }
}
