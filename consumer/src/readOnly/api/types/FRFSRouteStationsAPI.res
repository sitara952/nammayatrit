open FRFSStationAPI
open FRFSVehicleServiceTierAPI
open LatLong
open PriceAPIEntity
open Utils

@genType
type fRFSRouteStationsAPI = {
  code: string,
  color: option<string>,
  endPoint: latLong,
  longName: string,
  priceWithCurrency: priceAPIEntity,
  sequenceNum: option<int>,
  shortName: string,
  startPoint: latLong,
  stations: array<fRFSStationAPI>,
  travelTime: option<int>,
  vehicleServiceTier: option<fRFSVehicleServiceTierAPI>,
}

let decodeFRFSRouteStationsAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          color: getOptionString(dict, "color"),
          endPoint: dict
          ->Dict.get("endPoint")
          ->Option.getExn(~message="endPoint is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="endPoint is coming as undefined"),
          longName: getOptionString(dict, "longName")->Option.getExn(~message="longName not found"),
          priceWithCurrency: dict
          ->Dict.get("priceWithCurrency")
          ->Option.getExn(~message="priceWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="priceWithCurrency is coming as undefined"),
          sequenceNum: getOptionInt(dict, "sequenceNum"),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
          startPoint: dict
          ->Dict.get("startPoint")
          ->Option.getExn(~message="startPoint is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="startPoint is coming as undefined"),
          stations: dict
          ->Dict.get("stations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stations is not of array")
          ->Array.map(x =>
            decodeFRFSStationAPI(x)->Utils.getResultExn(~message="stations is coming as undefined")
          ),
          travelTime: getOptionInt(dict, "travelTime"),
          vehicleServiceTier: dict
          ->Dict.get("vehicleServiceTier")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeFRFSVehicleServiceTierAPI(x)->Result.mapOr(None, x => Some(x))
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSRouteStationsAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSRouteStationsAPI) => {
  req->asJson
}
