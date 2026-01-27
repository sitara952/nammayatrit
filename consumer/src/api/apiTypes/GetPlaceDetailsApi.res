open LatLong
open Utils
open HelperSaved

type getPlaceDetailsReq = {
  placeId: string,
  sessionToken: string,
}

type getPlaceDetailsRes = {location: option<latLong>}

let getLocation = (dict, key) => LatLongUtils.extractLatLon(dict, key)

let itemToObjectMapper = dict => {
  let dict = dict->JSON.Decode.object
  dict->Option.mapOr({location: None}, dict => {location: getLocation(dict, "location")})
}

let toJson = (req: getPlaceDetailsReq) => {
  req->asJson
}
