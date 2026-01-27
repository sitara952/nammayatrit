open FRFSTransitStop
open Utils

@genType
type fRFSTransitStopsCache = {stops: array<fRFSTransitStop>}

let decodeFRFSTransitStopsCache = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stops is not of array")
          ->Array.map(x =>
            decodeFRFSTransitStop(x)->Utils.getResultExn(~message="stops is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTransitStopsCache ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTransitStopsCache) => {
  req->asJson
}
