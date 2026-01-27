open ReactQuery
open Utils
open AutoCompleteReq

type postFixViewType = CustomIcon(React.element) | Text | NoIcon

@genType
type autoCompleteBody = {
  text: string,
  currentLocation: option<LocationTypes.location>,
}

type autoCompleteItem = {
  prefixImage: string,
  postfixViewType: postFixViewType,
  postfixText: string,
  locationData: option<LocationTypes.location>,
}

@genType
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

let mkAutoCompleteReq = async (~input, ~currentLocation: option<LocationTypes.location>) => {
  let (lat, lon) = switch currentLocation {
  | Some(location) =>
    switch (location.lat, location.lng) {
    | (Some(lat), Some(lng)) => (lat, lng)
    | (_, _) => await getLastKnowLocation()
    }
  | None => await getLastKnowLocation()
  }
  {
    autoCompleteType: Some(Enums.AutoCompleteType.PICKUP),
    input,
    language: Enums.Language.ENGLISH,
    location: lat->Float.toString ++ "," ++ lon->Float.toString,
    origin: Some({
      lat,
      lon,
    }),
    radius: 160934, //100 miles
    radiusWithUnit: None,
    types_: None,
    sessionToken: None,
    strictbounds: Some(true),
  }
}

let transformApiData = (~data: option<result<AutoCompleteResp.autoCompleteResp, exn>>) => {
  let transformData = switch data {
  | Some(Ok(obj)) => obj.predictions
  | Some(Error(exn)) =>
    Console.log2("Error: ", exn)
    []
  | None =>
    Console.log("No data available")
    []
  }
  transformData
}

let constructSearchListData = (~predictionList) => {
  []
}

let useMapsAutoCompletePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: AutoCompleteReq.autoCompleteReq) =>
      MapsAutoCompletePost.mapsAutoCompletePostApiCall((body: AutoCompleteReq.autoCompleteReq)),
  })
}

@genType
let getLocationsFromPredictions = (prediction: array<Prediction.prediction>): array<
  LocationTypes.location,
> => {
  prediction->Array.map((prediction): LocationTypes.location => {
    let (heading, subHeading) = LocationUtils.getLocationHeadings(prediction.description)
    Console.log2("Search results id", prediction.placeId)
    {
      lat: None,
      lng: None,
      placeId: Some(prediction.placeId->Option.getOr("")),
      title: heading,
      subtitle: subHeading,
      tag: AUTOCOMPLETE,
      serviceable: None,
      serviceabilityCity: None,
      hotSpotInfo: None,
      addressComponents: Some(
        LocationUtils.getAddressFromComponents(prediction.description, prediction.placeId, None),
      ),
      formattedAddress: Some(prediction.description),
      specialLocation: None,
      locationType: prediction.types,
      distanceFromCurrentLocation: Some(
        Float.toFixed(
          prediction.distance->Option.getOr(0)->Int.toFloat *. 0.001,
          ~digits=1,
        ) ++ " km",
      ),
    }
  })
}
