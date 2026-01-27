open FRFSRouteAPI
open FRFSStationAPI
open Utils

@genType
type autocompleteRes = {
  routes: array<fRFSRouteAPI>,
  stops: array<fRFSStationAPI>,
}

let decodeAutocompleteRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          routes: dict
          ->Dict.get("routes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="routes is not of array")
          ->Array.map(x =>
            decodeFRFSRouteAPI(x)->Utils.getResultExn(~message="routes is coming as undefined")
          ),
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stops is not of array")
          ->Array.map(x =>
            decodeFRFSStationAPI(x)->Utils.getResultExn(~message="stops is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AutocompleteRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: autocompleteRes) => {
  req->asJson
}
