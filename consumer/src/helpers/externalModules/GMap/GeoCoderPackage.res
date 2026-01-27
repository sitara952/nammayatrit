type geoCoordinate = {
  latitude: float,
  longitude: float,
}

@scope(("NativeModules", "GeoCoder")) @module("react-native")
external getLocName: (float, float) => Promise.t<string> = "getLocName"

@scope(("NativeModules", "GeoCoder")) @module("react-native")
external getGeoCoordinateFromAddress: string => Promise.t<geoCoordinate> =
  "getGeoCoordinateFromAddress"

@scope(("NativeModules", "GeoCoder")) @module("react-native")
external getAddressTranslation: string => Promise.t<string> = "getAddressTranslation"

let getPlaceNameByLatLon = async (latitude, longitude) => {
  try {
    let placeName = await getLocName(latitude, longitude)
    Some(placeName)
  } catch {
  | _ =>
    try {
      let placeName = await Promise.make((resolve, reject) => {
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.getPlaceName,
          ~body=GetPlaceNameApi.getPlaceNameRequest({
            getBy: GetPlaceNameApi.PlaceByLatLon({
              contents: {lat: latitude, lon: longitude},
              tag: "ByLatLong",
            }),
            language: "ENGLISH",
            sessionToken: "default-session-token",
          })->GetPlaceNameApi.toJson,
          ~onSuccess={
            resp => {
              let placeNameResp = GetPlaceNameApi.itemToObjectMapper(resp)
              switch placeNameResp->Array.get(0) {
              | Some(placeNameResp) => resolve(placeNameResp.formattedAddress)
              | None => reject("Unable to parse placeNameResp")
              }
            }
          },
          ~onError={
            err => {
              reject(err)
            }
          },
        )->ignore
      })
      Some(placeName)
    } catch {
    | _ => None
    }
  }
}

let getLatLonByPlaceName = async address => {
  try {
    let location = await getGeoCoordinateFromAddress(address)
    Some(location)
  } catch {
  | _ =>
    try {
      let body = await AutoCompleteTypes.mkAutoCompleteReq(address, None)
      let placeId = await Promise.make((resolve, reject) => {
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.autoComplete,
          ~body=body->AutoCompleteTypes.toJson,
          ~onSuccess={
            resp =>
              switch resp->JSON.Decode.object {
              | Some(obj) => {
                  let prediction = AutoCompleteTypes.itemToObjectMapper(obj)
                  let mbPlaceId =
                    prediction.predictions[0]->Option.map(prediction => prediction.placeId)
                  switch mbPlaceId {
                  | Some(placeId) => resolve(placeId)
                  | None => reject("PlaceId not found")
                  }
                }
              | None => reject("Unable to decode autoCompleteResp")
              }
          },
          ~onError={
            err => {
              reject(err)
            }
          },
        )->ignore
      })
      let location = await Promise.make((resolve, reject) => {
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.getPlaceName,
          ~body=GetPlaceNameApi.getPlaceNameRequest({
            getBy: GetPlaceNameApi.PlaceByPlaceId({
              contents: placeId,
              tag: "ByPlaceId",
            }),
            language: "ENGLISH",
            sessionToken: "default-session-token",
          })->GetPlaceNameApi.toJson,
          ~onSuccess={
            resp => {
              let placeNameResp = GetPlaceNameApi.itemToObjectMapper(resp)
              switch placeNameResp->Array.get(0) {
              | Some(placeNameResp) => resolve(placeNameResp.location)
              | None => reject("Unable to parse placeNameResp")
              }
            }
          },
          ~onError={
            err => {
              reject(err)
            }
          },
        )->ignore
      })
      switch location {
      | Some(location) => Some({latitude: location.lat, longitude: location.lon})
      | None => None
      }
    } catch {
    | _ => None
    }
  }
}
