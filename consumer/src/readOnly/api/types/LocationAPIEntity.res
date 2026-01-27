open Utils

@genType
type locationAPIEntity = {
  area: option<string>,
  areaCode: option<string>,
  building: option<string>,
  city: option<string>,
  country: option<string>,
  door: option<string>,
  extras: option<string>,
  id: string,
  instructions: option<string>,
  lat: float,
  lon: float,
  placeId: option<string>,
  state: option<string>,
  street: option<string>,
  title: option<string>,
  ward: option<string>,
}

let decodeLocationAPIEntity = data => {
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
          extras: getOptionString(dict, "extras"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          instructions: getOptionString(dict, "instructions"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          placeId: getOptionString(dict, "placeId"),
          state: getOptionString(dict, "state"),
          street: getOptionString(dict, "street"),
          title: getOptionString(dict, "title"),
          ward: getOptionString(dict, "ward"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LocationAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: locationAPIEntity) => {
  req->asJson
}
