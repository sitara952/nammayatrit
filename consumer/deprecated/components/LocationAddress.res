open Utils
@genType
type locationAddress = {
  area: option<string>,
  areaCode: option<string>,
  building: option<string>,
  city: option<string>,
  country: option<string>,
  door: option<string>,
  placeId: option<string>,
  state: option<string>,
  street: option<string>,
  ward: option<string>,
}

let getComponents = (dict, key) => {
  switch dict->Dict.get(key) {
  | Some(key) =>
    switch key->JSON.Decode.object {
    | Some(obj) =>
      Some({
        area: getOptionString(obj, "area"),
        areaCode: getOptionString(obj, "areaCode"),
        building: getOptionString(obj, "building"),
        city: getOptionString(obj, "city"),
        country: getOptionString(obj, "country"),
        state: getOptionString(obj, "state"),
        door: getOptionString(obj, "door"),
        street: getOptionString(obj, "street"),
        ward: getOptionString(obj, "ward"),
        placeId: getOptionString(obj, "placeId"),
      })
    | None => None
    }
  | None => None
  }
}
