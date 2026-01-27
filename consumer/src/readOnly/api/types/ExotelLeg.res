open Enums
open Utils

@genType
type exotelLeg = {
  onCallDuration: int,
  status: ExotelCallStatus.exotelCallStatus,
}

let decodeExotelLeg = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          onCallDuration: getOptionInt(dict, "onCallDuration")->Option.getExn(
            ~message="onCallDuration not found",
          ),
          status: ExotelCallStatus.decodeExotelCallStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExotelLeg ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: exotelLeg) => {
  req->asJson
}
