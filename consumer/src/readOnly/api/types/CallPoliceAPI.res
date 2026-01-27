open Utils

@genType
type callPoliceAPI = {rideId: string}

let decodeCallPoliceAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CallPoliceAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: callPoliceAPI) => {
  req->asJson
}
