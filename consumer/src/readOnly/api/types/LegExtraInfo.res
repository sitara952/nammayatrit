open BusLegExtraInfo
open MetroLegExtraInfo
open SubwayLegExtraInfo
open TaxiLegExtraInfo
open WalkLegExtraInfo
open Utils

@genType
type legExtraInfo =
  | Walk(walkLegExtraInfo)
  | Taxi(taxiLegExtraInfo)
  | Metro(metroLegExtraInfo)
  | Bus(busLegExtraInfo)
  | Subway(subwayLegExtraInfo)

let decodeLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("Walk") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeWalkLegExtraInfo
            ->Result.map(x => Walk(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Taxi") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeTaxiLegExtraInfo
            ->Result.map(x => Taxi(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Metro") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeMetroLegExtraInfo
            ->Result.map(x => Metro(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Bus") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeBusLegExtraInfo
            ->Result.map(x => Bus(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Subway") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeSubwayLegExtraInfo
            ->Result.map(x => Subway(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legExtraInfo) => {
  req->asJson
}
