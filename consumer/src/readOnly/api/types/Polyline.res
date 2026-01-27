open Utils

@genType
type polyline = {encodedPolyline: string}

let decodePolyline = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          encodedPolyline: getOptionString(dict, "encodedPolyline")->Option.getExn(
            ~message="encodedPolyline not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Polyline ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: polyline) => {
  req->asJson
}
