open ExtendLegStartPoint
open LocationAPIEntity
open Utils

@genType
type extendLegGetFareReq = {
  endLocation: option<locationAPIEntity>,
  startLocation: extendLegStartPoint,
}

let decodeExtendLegGetFareReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          endLocation: dict
          ->Dict.get("endLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          startLocation: dict
          ->Dict.get("startLocation")
          ->Option.getExn(~message="startLocation is not found")
          ->decodeExtendLegStartPoint
          ->Utils.getResultExn(~message="startLocation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExtendLegGetFareReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: extendLegGetFareReq) => {
  req->asJson
}
