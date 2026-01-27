open Enums
open Utils

@genType
type availableRoute = {
  quoteId: option<string>,
  routeCode: string,
  routeLongName: string,
  routeShortName: string,
  routeTimings: array<int>,
  serviceTierName: option<string>,
  source: SourceType.sourceType,
  serviceTierType: option<FRFSServiceTierType.fRFSServiceTierType>,
}

let decodeAvailableRoute = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quoteId: getOptionString(dict, "quoteId"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          routeLongName: getOptionString(dict, "routeLongName")->Option.getExn(
            ~message="routeLongName not found",
          ),
          routeShortName: getOptionString(dict, "routeShortName")->Option.getExn(
            ~message="routeShortName not found",
          ),
          routeTimings: getOptionIntArrayFromDict(dict, "routeTimings")->Option.getExn(
            ~message="routeTimings not found",
          ),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          source: SourceType.decodeSourceTypeResult(dict, "source")->Utils.getResultExn(
            ~message="source is coming as undefined",
          ),
          serviceTierType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AvailableRoute ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: availableRoute) => {
  req->asJson
}
