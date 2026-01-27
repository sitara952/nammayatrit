open Utils

@genType
type onboardedVehicleDetailsReq = {vehicleNumber: string}

let decodeOnboardedVehicleDetailsReq = data => {
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
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OnboardedVehicleDetailsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: onboardedVehicleDetailsReq) => {
  req->asJson
}
