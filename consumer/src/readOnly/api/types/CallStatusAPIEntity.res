open Enums
open Utils

@genType
type callStatusAPIEntity = {
  callStatusId: string,
  rideId: option<string>,
  status: CallStatus.callStatus,
}

let decodeCallStatusAPIEntity = data => {
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
          rideId: getOptionString(dict, "rideId"),
          status: CallStatus.decodeCallStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CallStatusAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: callStatusAPIEntity) => {
  req->asJson
}
