open LatLong
open Utils

@genType
type gatesInfo = {
  address: option<string>,
  name: string,
  point: latLong,
}

let decodeGatesInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: getOptionString(dict, "address"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          point: dict
          ->Dict.get("point")
          ->Option.getExn(~message="point is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="point is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GatesInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: gatesInfo) => {
  req->asJson
}
