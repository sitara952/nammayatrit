open ExtendLegStartPointStartLegOrder
open StartLocationType
open Utils

@genType
type extendLegStartPoint =
  StartLocation(startLocationType) | StartLegOrder(extendLegStartPointStartLegOrder)

let decodeExtendLegStartPoint = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("StartLocation") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeStartLocationType
            ->Result.map(x => StartLocation(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("StartLegOrder") =>
            data
            ->decodeExtendLegStartPointStartLegOrder
            ->Result.map(x => StartLegOrder(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExtendLegStartPoint ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: extendLegStartPoint) => {
  req->asJson
}
