open Utils

@genType
type shareRideReq = {emergencyContactNumbers: array<string>}

let decodeShareRideReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          emergencyContactNumbers: getOptionStrArrayFromDict(
            dict,
            "emergencyContactNumbers",
          )->Option.getExn(~message="emergencyContactNumbers not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ShareRideReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: shareRideReq) => {
  req->asJson
}
