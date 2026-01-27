open SDKPayloadDetails
open Utils

@genType
type sDKPayload = {
  payload: sDKPayloadDetails,
  requestId: option<string>,
  service: option<string>,
}

let decodeSDKPayload = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          payload: dict
          ->Dict.get("payload")
          ->Option.getExn(~message="payload is not found")
          ->decodeSDKPayloadDetails
          ->Utils.getResultExn(~message="payload is coming as undefined"),
          requestId: getOptionString(dict, "requestId"),
          service: getOptionString(dict, "service"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SDKPayload ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sDKPayload) => {
  req->asJson
}
