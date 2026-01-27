open LocationAddress
open Utils

@genType
type journeyLegsReq = {
  destinationAddress: locationAddress,
  legNumber: int,
  originAddress: locationAddress,
}

let decodeJourneyLegsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destinationAddress: dict
          ->Dict.get("destinationAddress")
          ->Option.getExn(~message="destinationAddress is not found")
          ->decodeLocationAddress
          ->Utils.getResultExn(~message="destinationAddress is coming as undefined"),
          legNumber: getOptionInt(dict, "legNumber")->Option.getExn(~message="legNumber not found"),
          originAddress: dict
          ->Dict.get("originAddress")
          ->Option.getExn(~message="originAddress is not found")
          ->decodeLocationAddress
          ->Utils.getResultExn(~message="originAddress is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyLegsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyLegsReq) => {
  req->asJson
}
