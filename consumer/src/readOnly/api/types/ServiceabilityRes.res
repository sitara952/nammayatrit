open Enums
open HotSpotInfo
open SpecialLocationFull
open Utils

@genType
type serviceabilityRes = {
  blockRadius: option<int>,
  city: option<City.city>,
  currentCity: option<City.city>,
  geoJson: option<string>,
  hotSpotInfo: array<hotSpotInfo>,
  isMetroServiceable: option<bool>,
  isSubwayServiceable: option<bool>,
  serviceable: bool,
  specialLocation: option<specialLocationFull>,
}

let decodeServiceabilityRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          blockRadius: getOptionInt(dict, "blockRadius"),
          city: City.decodeCityResult(dict, "city")->Result.mapOr(None, x => Some(x)),
          currentCity: City.decodeCityResult(dict, "currentCity")->Result.mapOr(None, x => Some(x)),
          geoJson: getOptionString(dict, "geoJson"),
          hotSpotInfo: dict
          ->Dict.get("hotSpotInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="hotSpotInfo is not of array")
          ->Array.map(x =>
            decodeHotSpotInfo(x)->Utils.getResultExn(~message="hotSpotInfo is coming as undefined")
          ),
          isMetroServiceable: getOptionBool(dict, "isMetroServiceable"),
          isSubwayServiceable: getOptionBool(dict, "isSubwayServiceable"),
          serviceable: getOptionBool(dict, "serviceable")->Option.getExn(
            ~message="serviceable not found",
          ),
          specialLocation: dict
          ->Dict.get("specialLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeSpecialLocationFull(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ServiceabilityRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: serviceabilityRes) => {
  req->asJson
}
