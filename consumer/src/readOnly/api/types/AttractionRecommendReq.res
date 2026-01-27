open Utils

@genType
type attractionRecommendReq = {
  count: int,
  lat: float,
  lon: float,
  radius: float,
}

let decodeAttractionRecommendReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          count: getOptionInt(dict, "count")->Option.getExn(~message="count not found"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          radius: getOptionFloat(dict, "radius")->Option.getExn(~message="radius not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AttractionRecommendReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: attractionRecommendReq) => {
  req->asJson
}
