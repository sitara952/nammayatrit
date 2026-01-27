open GateInfoFull
open GatesInfo
open Utils

@genType
type specialLocationFull = {
  category: string,
  createdAt: string,
  gates: array<gatesInfo>,
  gatesInfo: array<gateInfoFull>,
  geoJson: option<string>,
  id: string,
  linkedLocationsIds: array<string>,
  locationName: string,
  locationType: string,
  merchantOperatingCityId: option<string>,
}

let decodeSpecialLocationFull = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          category: getOptionString(dict, "category")->Option.getExn(~message="category not found"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          gates: dict
          ->Dict.get("gates")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="gates is not of array")
          ->Array.map(x =>
            decodeGatesInfo(x)->Utils.getResultExn(~message="gates is coming as undefined")
          ),
          gatesInfo: dict
          ->Dict.get("gatesInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="gatesInfo is not of array")
          ->Array.map(x =>
            decodeGateInfoFull(x)->Utils.getResultExn(~message="gatesInfo is coming as undefined")
          ),
          geoJson: getOptionString(dict, "geoJson"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          linkedLocationsIds: getOptionStrArrayFromDict(dict, "linkedLocationsIds")->Option.getExn(
            ~message="linkedLocationsIds not found",
          ),
          locationName: getOptionString(dict, "locationName")->Option.getExn(
            ~message="locationName not found",
          ),
          locationType: getOptionString(dict, "locationType")->Option.getExn(
            ~message="locationType not found",
          ),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SpecialLocationFull ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: specialLocationFull) => {
  req->asJson
}
