open Enums
open LatLong
open Utils

@genType
type gateInfoFull = {
  address: option<string>,
  canQueueUpOnGate: bool,
  defaultDriverExtra: option<int>,
  gateType: GateType.gateType,
  geoJson: option<string>,
  id: string,
  name: string,
  point: latLong,
  specialLocationId: string,
}

let decodeGateInfoFull = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: getOptionString(dict, "address"),
          canQueueUpOnGate: getOptionBool(dict, "canQueueUpOnGate")->Option.getExn(
            ~message="canQueueUpOnGate not found",
          ),
          defaultDriverExtra: getOptionInt(dict, "defaultDriverExtra"),
          gateType: GateType.decodeGateTypeResult(dict, "gateType")->Utils.getResultExn(
            ~message="gateType is coming as undefined",
          ),
          geoJson: getOptionString(dict, "geoJson"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          point: dict
          ->Dict.get("point")
          ->Option.getExn(~message="point is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="point is coming as undefined"),
          specialLocationId: getOptionString(dict, "specialLocationId")->Option.getExn(
            ~message="specialLocationId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GateInfoFull ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: gateInfoFull) => {
  req->asJson
}
