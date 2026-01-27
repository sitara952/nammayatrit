open Utils

@genType
type savedReqLocationAPIEntity = {
  area: option<string>,
  areaCode: option<string>,
  building: option<string>,
  city: option<string>,
  country: option<string>,
  door: option<string>,
  lat: float,
  locationName: option<string>,
  lon: float,
  placeId: option<string>,
  state: option<string>,
  street: option<string>,
  tag: string,
  ward: option<string>,
}

let decodeSavedReqLocationAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          area: getOptionString(dict, "area"),
          areaCode: getOptionString(dict, "areaCode"),
          building: getOptionString(dict, "building"),
          city: getOptionString(dict, "city"),
          country: getOptionString(dict, "country"),
          door: getOptionString(dict, "door"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          locationName: getOptionString(dict, "locationName"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          placeId: getOptionString(dict, "placeId"),
          state: getOptionString(dict, "state"),
          street: getOptionString(dict, "street"),
          tag: getOptionString(dict, "tag")->Option.getExn(~message="tag not found"),
          ward: getOptionString(dict, "ward"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SavedReqLocationAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: savedReqLocationAPIEntity) => {
  req->asJson
}
