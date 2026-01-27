open Gate
open SuggestedStations
open Utils

@genType
type transportStation = {
  ad: option<string>,
  cd: string,
  gi: option<array<gate>>,
  gj: option<string>,
  hin: option<string>,
  ibc: string,
  ln: float,
  lt: float,
  nm: string,
  rgn: option<string>,
  sgstdDest: option<array<suggestedStations>>,
  vt: string,
}

let decodeTransportStation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          ad: getOptionString(dict, "ad"),
          cd: getOptionString(dict, "cd")->Option.getExn(~message="cd not found"),
          gi: dict
          ->Dict.get("gi")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeGate(x)->Utils.getResultExn(~message="gi is coming as undefined")
            )
          ),
          gj: getOptionString(dict, "gj"),
          hin: getOptionString(dict, "hin"),
          ibc: getOptionString(dict, "ibc")->Option.getExn(~message="ibc not found"),
          ln: getOptionFloat(dict, "ln")->Option.getExn(~message="ln not found"),
          lt: getOptionFloat(dict, "lt")->Option.getExn(~message="lt not found"),
          nm: getOptionString(dict, "nm")->Option.getExn(~message="nm not found"),
          rgn: getOptionString(dict, "rgn"),
          sgstdDest: dict
          ->Dict.get("sgstdDest")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeSuggestedStations(x)->Utils.getResultExn(
                ~message="sgstdDest is coming as undefined",
              )
            )
          ),
          vt: getOptionString(dict, "vt")->Option.getExn(~message="vt not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportStation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: transportStation) => {
  req->asJson
}
