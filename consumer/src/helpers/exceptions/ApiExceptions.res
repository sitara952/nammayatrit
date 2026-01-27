@deriving(abstract)
type httpErrorCode =
  | BadRequest // 400
  | Unauthorized // 401
  | PaymentRequired // 402
  | Forbidden // 403
  | NotFound // 404
  | MethodNotAllowed // 405
  | NotAcceptable // 406
  | ProxyAuthenticationRequired // 407
  | RequestTimeout // 408
  | Conflict // 409
  | Gone // 410
  | LengthRequired // 411
  | PreconditionFailed // 412
  | PayloadTooLarge // 413
  | URITooLong // 414
  | UnsupportedMediaType // 415
  | RangeNotSatisfiable // 416
  | ExpectationFailed // 417
  | ImATeapot // 418 (fun Easter egg)
  | UnprocessableEntity // 422
  | Locked // 423
  | FailedDependency // 424
  | TooEarly // 425
  | UpgradeRequired // 426
  | PreconditionRequired // 428
  | TooManyRequests // 429
  | RequestHeaderFieldsTooLarge // 431
  | UnavailableForLegalReasons // 451
  | InternalServerError // 500
  | NotImplemented // 501
  | BadGateway // 502
  | ServiceUnavailable // 503
  | GatewayTimeout // 504
  | HTTPVersionNotSupported // 505
  | VariantAlsoNegotiates // 506
  | InsufficientStorage // 507
  | LoopDetected // 508
  | NotExtended // 510
  | NetworkAuthenticationRequired // 511

// Helper function to map integer codes to enum
let fromStatusCode = (code: int): option<httpErrorCode> =>
  switch code {
  | 400 => Some(BadRequest)
  | 401 => Some(Unauthorized)
  | 402 => Some(PaymentRequired)
  | 403 => Some(Forbidden)
  | 404 => Some(NotFound)
  | 405 => Some(MethodNotAllowed)
  | 406 => Some(NotAcceptable)
  | 407 => Some(ProxyAuthenticationRequired)
  | 408 => Some(RequestTimeout)
  | 409 => Some(Conflict)
  | 410 => Some(Gone)
  | 411 => Some(LengthRequired)
  | 412 => Some(PreconditionFailed)
  | 413 => Some(PayloadTooLarge)
  | 414 => Some(URITooLong)
  | 415 => Some(UnsupportedMediaType)
  | 416 => Some(RangeNotSatisfiable)
  | 417 => Some(ExpectationFailed)
  | 418 => Some(ImATeapot)
  | 422 => Some(UnprocessableEntity)
  | 423 => Some(Locked)
  | 424 => Some(FailedDependency)
  | 425 => Some(TooEarly)
  | 426 => Some(UpgradeRequired)
  | 428 => Some(PreconditionRequired)
  | 429 => Some(TooManyRequests)
  | 431 => Some(RequestHeaderFieldsTooLarge)
  | 451 => Some(UnavailableForLegalReasons)
  | 500 => Some(InternalServerError)
  | 501 => Some(NotImplemented)
  | 502 => Some(BadGateway)
  | 503 => Some(ServiceUnavailable)
  | 504 => Some(GatewayTimeout)
  | 505 => Some(HTTPVersionNotSupported)
  | 506 => Some(VariantAlsoNegotiates)
  | 507 => Some(InsufficientStorage)
  | 508 => Some(LoopDetected)
  | 510 => Some(NotExtended)
  | 511 => Some(NetworkAuthenticationRequired)
  | _ => None // Undefined or non-error codes
  }

type httpError = {
  errorType: option<httpErrorCode>,
  errorMessage: string,
  errorPayload: string,
}

exception APIError(httpError)
