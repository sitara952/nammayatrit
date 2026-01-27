open GetPlaceNameByByPlaceId
open LatLong
open Utils

@genType
type getPlaceNameBy = ByLatLong(latLong) | ByPlaceId(getPlaceNameByByPlaceId)

let decodeGetPlaceNameBy = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("ByLatLong") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeLatLong
            ->Result.map(x => ByLatLong(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("ByPlaceId") =>
            data
            ->decodeGetPlaceNameByByPlaceId
            ->Result.map(x => ByPlaceId(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPlaceNameBy ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPlaceNameBy) => {
  req->asJson
}
