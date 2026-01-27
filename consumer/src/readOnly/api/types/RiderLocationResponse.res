open Utils
open BusLocation

@genType
type riderLocationResponse = {buses: array<busLocation>}

let decodeRiderLocationResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          buses: dict
          ->Dict.get("buses")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="buses is not of array")
          ->Array.map(x =>
            decodeBusLocation(x)->Utils.getResultExn(~message="buses is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RiderLocationResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: riderLocationResponse) => {
  req->asJson
}
