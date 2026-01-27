open LatLong
open Utils

@genType
type multimodalTransitOptionsReq = {
  destLatLong: latLong,
  sourceLatLong: latLong,
}

let decodeMultimodalTransitOptionsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destLatLong: dict
          ->Dict.get("destLatLong")
          ->Option.getExn(~message="destLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="destLatLong is coming as undefined"),
          sourceLatLong: dict
          ->Dict.get("sourceLatLong")
          ->Option.getExn(~message="sourceLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="sourceLatLong is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalTransitOptionsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalTransitOptionsReq) => {
  req->asJson
}
