open AvailableRoutesByTier
open Utils

@genType
type legServiceTierOptionsResp = {options: array<availableRoutesByTier>}

let decodeLegServiceTierOptionsResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          options: dict
          ->Dict.get("options")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="options is not of array")
          ->Array.map(x =>
            decodeAvailableRoutesByTier(x)->Utils.getResultExn(
              ~message="options is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegServiceTierOptionsResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legServiceTierOptionsResp) => {
  req->asJson
}
