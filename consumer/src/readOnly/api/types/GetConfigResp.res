open Enums
open FRFSConfigAPIRes
open FRFSStationAPI
open Utils

@genType
type getConfigResp = {
  city: City.city,
  frfsConfig: fRFSConfigAPIRes,
  fromStation: fRFSStationAPI,
  toStation: fRFSStationAPI,
}

let decodeGetConfigResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          city: City.decodeCityResult(dict, "city")->Utils.getResultExn(
            ~message="city is coming as undefined",
          ),
          frfsConfig: dict
          ->Dict.get("frfsConfig")
          ->Option.getExn(~message="frfsConfig is not found")
          ->decodeFRFSConfigAPIRes
          ->Utils.getResultExn(~message="frfsConfig is coming as undefined"),
          fromStation: dict
          ->Dict.get("fromStation")
          ->Option.getExn(~message="fromStation is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="fromStation is coming as undefined"),
          toStation: dict
          ->Dict.get("toStation")
          ->Option.getExn(~message="toStation is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="toStation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetConfigResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getConfigResp) => {
  req->asJson
}
