open Utils

@genType
type callAttachments = {
  callStatusId: string,
  rideId: string,
}

let decodeCallAttachments = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          callStatusId: getOptionString(dict, "callStatusId")->Option.getExn(
            ~message="callStatusId not found",
          ),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CallAttachments ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: callAttachments) => {
  req->asJson
}
