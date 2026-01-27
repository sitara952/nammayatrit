open Utils
external asJson: _ => JSON.t = "%identity"
@genType
type latLong = {
  lat: float,
  lon: float,
}
@genType
type placeByLatLon = {
  contents: latLong,
  tag: string,
}
@genType
type placeByPlaceId = {
  contents: string,
  tag: string,
}
@genType
type getPlaceNameByEnum =
  | PlaceByLatLon(placeByLatLon)
  | PlaceByPlaceId(placeByPlaceId)

@genType
type getPlaceNameReq = {
  getBy: getPlaceNameByEnum,
  language: string,
  sessionToken: string,
}

let getPlaceNameRequest = (req: getPlaceNameReq) => {
  {
    "getBy": switch req.getBy {
    | PlaceByLatLon(placeByLatLon) => placeByLatLon->asJson
    | PlaceByPlaceId(placeByPlaceId) => placeByPlaceId->asJson
    },
    "language": req.language,
    "sessionToken": req.sessionToken,
  }
}

let toJson = req => {
  req->asJson
}
@genType
type addressComponents = {
  longName: string,
  shortName: string,
  types: array<string>,
}
@genType
type placeName = {
  addressComponents: array<addressComponents>,
  formattedAddress: string,
  location: option<latLong>,
  placeId: option<string>,
  plusCode: option<string>,
}
@genType
type placeNameResp = array<placeName>

let getLocation = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.flatMap(dict => {
    let lat = getOptionFloat(dict, "lat")
    let lon = getOptionFloat(dict, "lon")
    switch (lat, lon) {
    | (Some(lat), Some(lon)) => Some({lat, lon})
    | _ => None
    }
  })
}

let defaultAddressResp = {
  longName: "",
  shortName: "",
  types: [],
}

let getStringArray = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.string)
}

let getAddressComponents = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      longName: getString(dict, "longName", ""),
      shortName: getString(dict, "shortName", ""),
      types: getStringArray(dict, "types"),
    }
  })
}

let itemToObjectMapper = (dict): placeNameResp => {
  dict
  ->JSON.Decode.array
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      addressComponents: getAddressComponents(dict, "addressComponents"),
      formattedAddress: getString(dict, "formattedAddress", ""),
      location: getLocation(dict, "location"),
      placeId: getOptionString(dict, "placeId"),
      plusCode: getOptionString(dict, "plusCode"),
    }
  })
}
