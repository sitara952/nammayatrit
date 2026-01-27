open Utils

@genType
type createSavedReqLocationReq = {
  area: option<string>,
  areaCode: option<string>,
  building: option<string>,
  city: option<string>,
  country: option<string>,
  door: option<string>,
  isMoved: option<bool>,
  lat: float,
  lon: float,
  placeId: option<string>,
  state: option<string>,
  street: option<string>,
  tag: string,
  ward: option<string>,
}

let decodeCreateSavedReqLocationReq = data => {
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
          isMoved: getOptionBool(dict, "isMoved"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
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
      Console.log2("CreateSavedReqLocationReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: createSavedReqLocationReq) => {
  req->asJson
}
