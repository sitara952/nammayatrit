open SDKPayloadDetails
open Utils

@genType
type updatePaymentOrderResp = {sdkPayload: option<sDKPayloadDetails>}

let decodeUpdatePaymentOrderResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sdkPayload: dict
          ->Dict.get("sdkPayload")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeSDKPayloadDetails(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdatePaymentOrderResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updatePaymentOrderResp) => {
  req->asJson
}
