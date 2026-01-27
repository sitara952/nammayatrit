open Utils

@genType
type callEventReq = {
  callType: string,
  exophoneNumber: string,
  rideId: string,
}

let decodeCallEventReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          callType: getOptionString(dict, "callType")->Option.getExn(~message="callType not found"),
          exophoneNumber: getOptionString(dict, "exophoneNumber")->Option.getExn(
            ~message="exophoneNumber not found",
          ),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CallEventReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: callEventReq) => {
  req->asJson
}
