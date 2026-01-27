open LocationTypes
open Utils

let getLocationApiEntity = (
  savedLoc: SavedReqLocationAPIEntity.savedReqLocationAPIEntity,
): locationApiEntity => {
  {
    door: savedLoc.door,
    building: savedLoc.building,
    street: savedLoc.street,
    area: savedLoc.area,
    city: savedLoc.city,
    state: savedLoc.state,
    country: savedLoc.country,
    lat: Some(savedLoc.lat),
    lon: Some(savedLoc.lon),
    ward: savedLoc.ward,
  }
}
type decodeAddress =
  Booking(locationApiEntity) | SavedLoc(SavedReqLocationAPIEntity.savedReqLocationAPIEntity)
let fetchLocationInfo = (location: decodeAddress): locationInfo => {
  let address = switch location {
  | Booking(location) => location
  | SavedLoc(savedLoc) => getLocationApiEntity(savedLoc)
  }

  let trimAndFilterEmpty = (opt: option<string>): option<string> => {
    opt->Option.map(s => String.trim(s))->Option.filter(s => s != "")
  }

  let addressComponents =
    [
      address.door,
      address.building,
      address.street,
      address.area,
      address.city,
      address.state,
      address.country,
    ]
    ->Array.map(trimAndFilterEmpty)
    ->Array.filter(Option.isSome)
    ->Array.map(Option.getUnsafe)
    ->Array.join(", ")

  let ward = address.ward->trimAndFilterEmpty->Option.getOr("")

  {ward, address: addressComponents, lat: address.lat, lon: address.lon}
}

let areaCodeRegex = "\\b\\d{6}\\b"

let extractKeyByRegex = (regex: string, text: string): string => {
  let _ = regex
  let _ = text
  //let re = Js.Re.fromString(regex)
  ""
  // switch Js.Re.exec_(re, text) {
  // | Some(matches) =>
  //   switch Js.Re.exec_(re, text) {
  //   | Some(matchText) => Js.Re.matchText
  //   | None => ""
  //   }
  // | None => ""
  // }
}
let getValueByComponent = (
  addressComponents: array<GetPlaceNameApi.addressComponents>,
  componentName: string,
): string => {
  let component =
    addressComponents->Array.find(component => component.types->Array.includes(componentName))
  switch component {
  | Some(component) => component.longName
  | None => ""
  }
}
let getWard = (ward, area, street, building) => {
  let actualWard = switch ward {
  | Some(w) => String.trim(w) == "" ? None : ward
  | None => None
  }

  let actualArea = switch area {
  | Some(a) => String.trim(a) == "" ? None : Some(a ++ ", ")
  | None => None
  }

  let actualStreet = switch street {
  | Some(s) => String.trim(s) == "" ? None : Some(s ++ ", ")
  | None => None
  }

  let actualBuilding = switch building {
  | Some(b) => String.trim(b) == "" ? None : building
  | None => None
  }

  switch actualWard {
  | Some(_) => actualWard
  | None =>
    switch (actualArea, actualStreet, actualBuilding) {
    | (Some(a), Some(s), Some(b)) => Some(a ++ s ++ b)
    | (Some(a), Some(s), None) => Some(a ++ s)
    | (Some(a), None, None) => Some(a)
    | (None, Some(s), None) => Some(s)
    | (None, None, Some(b)) => Some(b)
    | _ => None
    }
  }
}

let getAddressFromComponents = (
  formattedAddress: string,
  placeId: option<string>,
  addressComponents: option<array<GetPlaceNameApi.addressComponents>>,
): LocationAddress.locationAddress => {
  let splitedAddress = String.split(formattedAddress, ", ")
  let lengthAddressC = splitedAddress->Array.length
  let areaCodeFromFullAdd = extractKeyByRegex(areaCodeRegex, formattedAddress)
  let areaCodeFromAddComp = getValueByComponent(addressComponents->Option.getOr([]), "postal_code")
  // let areaCodeComp: string =
  //   String.trim(areaCodeFromAddComp) == "" ? areaCodeFromFullAdd : areaCodeFromAddComp

  let gateName = getValueByComponent(addressComponents->Option.getOr([]), "sublocality")
  {
    area: gateName == "" ? splitedAddress[lengthAddressC - 4] : Some(gateName),
    areaCode: Some(
      String.trim(areaCodeFromAddComp) != "" ? areaCodeFromAddComp : areaCodeFromFullAdd,
    ),
    building: splitedAddress[lengthAddressC - 6],
    city: splitedAddress[lengthAddressC - 3],
    country: splitedAddress[lengthAddressC - 1],
    state: splitedAddress->Array.get(lengthAddressC - 2),
    door: if lengthAddressC > 7 {
      splitedAddress[0]->Option.map(door => door ++ ", " ++ splitedAddress[1]->Option.getOr(""))
    } else if lengthAddressC == 7 {
      splitedAddress->Array.get(0)
    } else {
      None
    },
    street: splitedAddress->Array.get(lengthAddressC - 5),
    ward: getWard(
      None,
      switch splitedAddress->Array.get(lengthAddressC - 4) {
      | Some(area) => Some(area)
      | None => None
      },
      switch splitedAddress->Array.get(lengthAddressC - 5) {
      | Some(street) => Some(street)
      | None => None
      },
      switch splitedAddress->Array.get(lengthAddressC - 6) {
      | Some(building) => Some(building)
      | None => None
      },
    ),
    title: Some(""),
    placeId,
    extras: Some(""),
    instructions: Some(""),
  }
}
let encodeAddressDescription = (
  ~description: string,
  ~addressComponents: array<GetPlaceNameApi.addressComponents>,
  ~tag: string,
  ~placeId: option<string>,
  ~lat: float,
  ~lon: float,
): SavedReqLocationAPIEntity.savedReqLocationAPIEntity => {
  let splitedAddress = Js.String.split(", ", description)
  let totalAddressComponents = Array.length(splitedAddress)

  let area = if totalAddressComponents > 3 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 4), v => v ++ " ")
  } else {
    None
  }

  let building = if totalAddressComponents > 5 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 6), v => v ++ " ")
  } else {
    None
  }

  let city = if totalAddressComponents > 2 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 3), v => v ++ " ")
  } else {
    None
  }

  let country = if totalAddressComponents > 0 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 1), v => v ++ " ")
  } else {
    None
  }

  let state = if totalAddressComponents > 1 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 2), v => v ++ " ")
  } else {
    None
  }

  let door = if totalAddressComponents > 7 {
    Option.map(Option.map(splitedAddress->Array.get(0), v => v ++ " "), v =>
      v ++ " " ++ Option.mapOr(splitedAddress->Array.get(1), "", v => v ++ " ")
    )
  } else if totalAddressComponents == 7 {
    Option.map(splitedAddress->Array.get(0), v => v ++ " ")
  } else {
    None
  }

  let street = if totalAddressComponents > 4 {
    Option.map(splitedAddress->Array.get(totalAddressComponents - 5), v => v ++ " ")
  } else {
    None
  }

  let ward = if Array.length(addressComponents) == 0 {
    getWard(
      None,
      Option.map(splitedAddress->Array.get(totalAddressComponents - 4), v => v ++ " "),
      Option.map(splitedAddress->Array.get(totalAddressComponents - 5), v => v ++ " "),
      Option.map(splitedAddress->Array.get(totalAddressComponents - 6), v => v ++ " "),
    )
  } else {
    Some(getValueByComponent(addressComponents, "sublocality"))
  }

  {
    area,
    areaCode: None,
    building,
    city,
    country,
    state,
    door,
    street,
    lat,
    lon,
    tag,
    placeId,
    ward,
    locationName: None,
  }
}

let getLocationHeadings = location => {
  let descArr = String.split(location, ",")
  let len = Array.length(descArr)
  let subHeading = String.trim(Array.join(Array.slice(descArr, ~start=1, ~end=len), ", "))
  let heading = Array.slice(descArr, ~start=0, ~end=1)->Array.get(0)
  (heading, Some(subHeading))
}

let itemToObjectMapper = location => {
  {
    lat: getOptionFloat(location, "lat"),
    lng: getOptionFloat(location, "lng"),
    placeId: getOptionString(location, "placeId"),
    title: getOptionString(location, "title"),
    subtitle: getOptionString(location, "subtitle"),
    formattedAddress: getOptionString(location, "formattedAddress"),
    tag: switch getOptionString(location, "tag") {
    | Some("AUTOCOMPLETE") => AUTOCOMPLETE
    | Some("RECENTS") => RECENTS
    | Some("FAVOURITES") => FAVOURITES(getString(location, "tag", ""))
    | Some("PUBLIC_TRANSPORT_RECENTS") => PUBLIC_TRANSPORT_RECENTS
    | _ => AUTOCOMPLETE
    },
    // addressComponents: LocationAddress.getComponents(location, "addressComponents"),
    addressComponents: location
    ->Dict.get("addressComponents")
    ->Option.map(x => x->LocationAddress.decodeLocationAddress->Result.getExn),
    serviceable: getOptionBool(location, "serviceable"),
    serviceabilityCity: getOptionString(location, "serviceabilityCity"),
    specialLocation: ServiceabilityApi.getSpecialLocation(location, "specialLocation"),
    locationType: None,
    distanceFromCurrentLocation: None,
    hotSpotInfo: Some(ServiceabilityApi.getHotSpotInfo(location, "hotSpotInfo")),
  }
}

let itemToObjectMapperSearchObject = data => {
  source: getDictfromDict(data, "source")->itemToObjectMapper,
  destination: getDictfromDict(data, "destination")->itemToObjectMapper,
  stops: getArrayFromDict(data, "stops", [])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => itemToObjectMapper(dict)),
}

let createLocation = (lat: float, lng: float) => {
  lat: Some(lat),
  lng: Some(lng),
  placeId: None,
  title: None,
  subtitle: None,
  specialLocation: None,
  formattedAddress: None,
  tag: AUTOCOMPLETE,
  addressComponents: None,
  serviceable: None,
  serviceabilityCity: None,
  locationType: None,
  distanceFromCurrentLocation: None,
  hotSpotInfo: None,
}

let createLocationByPlaceId = (~placeId: string) => {
  lat: None,
  lng: None,
  placeId: Some(placeId),
  title: None,
  subtitle: None,
  specialLocation: None,
  formattedAddress: None,
  tag: AUTOCOMPLETE,
  addressComponents: None,
  serviceable: None,
  serviceabilityCity: None,
  locationType: None,
  distanceFromCurrentLocation: None,
  hotSpotInfo: None,
}

let transformSpecialLocationToLocation = (
  specialLocation: ServiceabilityApi.specialLocation,
  serviceabilityCity: option<string>,
) => {
  let transformedLocations = specialLocation.gatesInfo->Array.map(item => {
    let transformedLocation: location = {
      lat: Some(item.point.lat),
      lng: Some(item.point.lon),
      placeId: Some(item.id),
      title: Some(item.name),
      subtitle: Some(item.address),
      formattedAddress: None,
      tag: AUTOCOMPLETE,
      serviceable: Some(true),
      serviceabilityCity,
      specialLocation: Some(specialLocation),
      addressComponents: None,
      locationType: None,
      distanceFromCurrentLocation: None,
      hotSpotInfo: None,
    }
    transformedLocation
  })
  transformedLocations
}

let getTitleSubtitle = (currentLocationData: location) => {
  let title = Option.getOr(currentLocationData.title, "")
  let subtitle = Option.getOr(currentLocationData.subtitle, "")
  switch (title, subtitle) {
  | ("", "") => ""
  | ("", subtitle) => subtitle
  | (title, "") => title
  | (title, subtitle) => title ++ ",  " ++ subtitle
  }
}

@genType
let modifyLocationArrayDistance = (~recents: array<location>, ~lat, ~lon) => {
  recents->Array.map(item => {
    let calculatedDistance = switch (lat, lon, item.lat, item.lng) {
    | (Some(lat1), Some(lng1), Some(lat2), Some(lng2)) =>
      Some(haversineDistance(lat1, lng1, lat2, lng2))
    | _ => None
    }

    switch calculatedDistance {
    | Some(dist) => {
        ...item,
        distanceFromCurrentLocation: Some(Float.toFixed(dist, ~digits=1) ++ " km"),
      }
    | None => item
    }
  })
}

module GetLocationAndServiceability = {
  @genType
  type serviceabilityType = Origin | Destination

  let fetchServiceability = async (
    ~lat: float,
    ~lon: float,
    ~type_: serviceabilityType,
  ): ServiceabilityApi.serviceabilityApiRespType => {
    let url = switch type_ {
    | Origin => ApiRoutes.apiRoutes.serviceability("origin")
    | Destination => ApiRoutes.apiRoutes.serviceability("destination")
    }

    let body = ServiceabilityApi.mkCheckServiceableReq(lat, lon)->ServiceabilityApi.toJson

    let resp = await ApiCall.callPostAPI'(~url, ~body)
    ServiceabilityApi.jsonToServiceabilityApiResType(resp)
  }

  // This fetchPlaceName function should not construct full location object, it should only fetch placeId or lat lon. Because of this we are facing issue in address
  // Currently fixed it in typescript by discarding addressComponents returned from this function.
  let fetchPlaceName = async (
    ~getBy: GetPlaceNameApi.getPlaceNameByEnum,
    ~title: option<string>,
    ~subtitle: option<string>,
    ~types: option<array<string>>,
    ~activeInput: option<string>,
  ): LocationTypes.locationWithServiceability => {
    let getPlaceNameReq = GetPlaceNameApi.getPlaceNameRequest({
      getBy,
      language: "ENGLISH",
      sessionToken: "default-session-token",
    })->GetPlaceNameApi.toJson
    let data = await ApiCall.callPostAPI'(
      ~url=ApiRoutes.apiRoutes.getPlaceName,
      ~body=getPlaceNameReq,
    )
    let mappedResp = GetPlaceNameApi.itemToObjectMapper(data)->Array.get(0)->Option.getExn
    let (
      serviceability,
      specialLocation,
      city,
      hotSpotInfo,
      isMetroServiceable,
      isSubwayServiceable,
      ptRestrictedHours,
    ) = switch mappedResp.location {
    | Some(latlon) =>
      let serviceable = await fetchServiceability(
        ~lat=latlon.lat,
        ~lon=latlon.lon,
        ~type_=activeInput === Some("source") ? Origin : Destination,
      )
      (
        Some(serviceable.serviceable),
        serviceable.specialLocation,
        Some(serviceable.city),
        Some(serviceable.hotSpotInfo),
        serviceable.isMetroServiceable,
        serviceable.isSubwayServiceable,
        serviceable.ptRestrictedHours,
      )
    | None => (Some(false), None, None, None, None, None, None)
    }
    let (heading: option<string>, subHeading: option<string>) = if (
      title == None && subtitle == None
    ) {
      getLocationHeadings(mappedResp.formattedAddress)
    } else {
      (title, subtitle)
    }
    let newLocation: LocationTypes.location = {
      lat: switch mappedResp.location {
      | Some(loc) => Some(loc.lat)
      | None => None
      },
      lng: switch mappedResp.location {
      | Some(loc) => Some(loc.lon)
      | None => None
      },
      placeId: mappedResp.placeId,
      title: heading,
      subtitle: subHeading,
      formattedAddress: Some(mappedResp.formattedAddress),
      tag: AUTOCOMPLETE,
      specialLocation,
      addressComponents: Some(
        getAddressFromComponents(
          mappedResp.formattedAddress,
          mappedResp.placeId,
          Some(mappedResp.addressComponents),
        ),
      ),
      serviceable: serviceability,
      serviceabilityCity: city,
      locationType: types,
      distanceFromCurrentLocation: None,
      hotSpotInfo,
    }
    {
      location: newLocation,
      isMetroServiceable,
      isSubwayServiceable,
      ptRestrictedHours,
    }
  }

  @genType
  let getLocationByGeoCoder = async (
    ~lat,
    ~lon,
    ~title: option<string>,
    ~subtitle: option<string>,
    ~types: option<array<string>>,
    ~activeInput: option<string>,
  ): option<LocationTypes.locationWithServiceability> => {
    let formattedAddress = await GeoCoderPackage.getPlaceNameByLatLon(lat, lon)
    switch formattedAddress {
    | Some(address) => {
        let addressComponents = getAddressFromComponents(address, None, None)
        let (heading: option<string>, subHeading: option<string>) = if (
          title == None && subtitle == None
        ) {
          getLocationHeadings(address)
        } else {
          (title, subtitle)
        }
        let serviceable = await fetchServiceability(
          ~lat,
          ~lon,
          ~type_=activeInput === Some("source") ? Origin : Destination,
        )
        let newLocation: LocationTypes.location = {
          lat: Some(lat),
          lng: Some(lon),
          placeId: None,
          title: heading,
          subtitle: subHeading,
          formattedAddress: Some(address),
          tag: AUTOCOMPLETE,
          specialLocation: serviceable.specialLocation,
          addressComponents: Some(addressComponents),
          serviceable: Some(serviceable.serviceable),
          hotSpotInfo: Some(serviceable.hotSpotInfo),
          serviceabilityCity: Some(serviceable.city),
          locationType: types,
          distanceFromCurrentLocation: None,
        }
        Some({
          location: newLocation,
          isMetroServiceable: serviceable.isMetroServiceable,
          isSubwayServiceable: serviceable.isSubwayServiceable,
          ptRestrictedHours: serviceable.ptRestrictedHours,
        })
      }
    | None => None
    }
  }

  @genType
  let getLocationObjectAndServiceability = async (
    ~getBy: GetPlaceNameApi.getPlaceNameByEnum,
    ~title: option<string>,
    ~subtitle: option<string>,
    ~types: option<array<string>>,
    ~activeInput: option<string>,
  ): LocationTypes.locationWithServiceability => {
    switch getBy {
    | PlaceByPlaceId(placeIdData) => {
        let getBy = GetPlaceNameApi.PlaceByPlaceId({
          GetPlaceNameApi.contents: placeIdData.contents,
          tag: "ByPlaceId",
        })
        await fetchPlaceName(~getBy, ~title, ~subtitle, ~types, ~activeInput)
      }
    | PlaceByLatLon(latlonInfo) => {
        let return = await getLocationByGeoCoder(
          ~lat=latlonInfo.contents.lat,
          ~lon=latlonInfo.contents.lon,
          ~title,
          ~subtitle,
          ~types,
          ~activeInput,
        )
        switch return {
        | Some(locationWithServiceability) => locationWithServiceability
        | None => {
            let getBy = GetPlaceNameApi.PlaceByLatLon({
              GetPlaceNameApi.contents: {
                lat: latlonInfo.contents.lat,
                lon: latlonInfo.contents.lon,
              },
              tag: "ByLatLong",
            })
            await fetchPlaceName(~getBy, ~title, ~subtitle, ~types, ~activeInput)
          }
        }
      }
    }
  }
}
