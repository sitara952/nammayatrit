open Utils

@genType
type passVerifyReq = {
  vehicleNumber: string,
  currentLat: option<float>,
  currentLon: option<float>,
  stopId: option<string>,
  autoActivated: option<bool>
}

let decodePassVerifyReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          vehicleNumber: getOptionString(dict, "vehicleNumber")->Option.getExn(
            ~message="vehicleNumber not found",
          ),
          currentLat: getOptionFloat(dict, "currentLat"),
          currentLon: getOptionFloat(dict, "currentLon"),
          stopId: getOptionString(dict, "stopId"),
          autoActivated: getOptionBool(dict, "autoActivated"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassVerifyReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passVerifyReq) => {
  req->asJson
}
