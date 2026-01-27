open Utils

external asJson: _ => JSON.t = "%identity"

type latlon = {
  lat: float,
  lon: float,
}

type prediction = {
  description: string,
  distance: int,
  placeId: string,
}

type autoCompleteRequestbody = {
  autoCompleteType: string,
  input: string,
  language: string,
  location: string,
  origin: latlon,
  radius: int,
  sessionToken: option<string>,
  strictbounds: option<bool>,
}

type autoCompleteApiResponseType = {predictions: array<prediction>}

// let toJson = req => {
//   req->asJson
// }

let defaultPrediction = {
  description: "",
  distance: 0,
  placeId: "",
}

let getPredictions = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      description: getString(dict, "description", defaultPrediction.description),
      distance: getInt(dict, "distance", defaultPrediction.distance),
      placeId: getString(dict, "placeId", defaultPrediction.placeId),
    }
  })
}

let itemToObjectMapper = dict => {
  {predictions: getPredictions(dict, "predictions")}
}

let getLastKnowLocation = async () => {
  let item = await EncryptedStorage.getItem(LAST_KNOWN_LOCATION)
  let a: option<GeoLocation.position> = switch item {
  | Some(val) =>
    Some(
      val
      ->JSON.parseExn
      ->getDictFromJson
      ->Dict.get("lastLocation")
      ->Option.getExn
      ->getDictFromJson
      ->GeoLocation.itemToObjectMapper,
    )
  | None => None
  }
  switch a {
  | Some(val) => (val.coords.latitude, val.coords.longitude)
  | None => (Constants.minneapolisDefaultCoordinate.lat, Constants.minneapolisDefaultCoordinate.lon)
  }
}

let mkAutoCompleteReq = async (input, currentLocation: option<LocationTypes.location>) => {
  let (lat, lon) = switch currentLocation {
  | Some(location) =>
    switch (location.lat, location.lng) {
    | (Some(lat), Some(lng)) => (lat, lng)
    | (_, _) => await getLastKnowLocation()
    }
  | None => await getLastKnowLocation()
  }
  {
    autoCompleteType: "PICKUP",
    input,
    language: "ENGLISH",
    location: lat->Float.toString ++ "," ++ lon->Float.toString,
    origin: {
      lat,
      lon,
    },
    radius: 160934, //100 miles
    sessionToken: None,
    strictbounds: Some(true),
  }
}

let toJson = (req: autoCompleteRequestbody) => {
  req->asJson
}

type autoCompleteBody = {
  text: string,
  currentLocation: option<LocationTypes.location>,
}

type postFixViewType = CustomIcon(React.element) | Text | NoIcon

type autoCompleteItem = {
  prefixImage: string,
  postfixViewType: postFixViewType,
  postfixText: string,
  locationData: option<LocationTypes.location>,
}
