open Utils

@genType
type locationAddress = {
  area: option<string>,
  areaCode: option<string>,
  building: option<string>,
  city: option<string>,
  country: option<string>,
  door: option<string>,
  extras: option<string>,
  instructions: option<string>,
  placeId: option<string>,
  state: option<string>,
  street: option<string>,
  title: option<string>,
  ward: option<string>,
}

let decodeLocationAddress = data => {
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
          instructions: getOptionString(dict, "instructions"),
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
      Console.log2("LocationAddress ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: locationAddress) => {
  req->asJson
}
