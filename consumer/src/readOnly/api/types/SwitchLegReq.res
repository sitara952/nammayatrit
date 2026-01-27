open Enums
open LatLngV2
open LocationAddress
open Utils

@genType
type switchLegReq = {
  legOrder: int,
  newMode: MultimodalTravelMode.multimodalTravelMode,
  originAddress: option<locationAddress>,
  startLocation: option<latLngV2>,
}

let decodeSwitchLegReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
          newMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "newMode",
          )->Utils.getResultExn(~message="newMode is coming as undefined"),
          originAddress: dict
          ->Dict.get("originAddress")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAddress(x)->Result.mapOr(None, x => Some(x))),
          startLocation: dict
          ->Dict.get("startLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLngV2(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SwitchLegReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: switchLegReq) => {
  req->asJson
}
