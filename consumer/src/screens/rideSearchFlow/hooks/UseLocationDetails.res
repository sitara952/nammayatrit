open ApiRoutes
open ServiceabilityApi

@genType
type serviceabilityType = Origin | Destination

@genType
let useLocationDetails = () => {
  let (location: option<LocationTypes.location>, setLocation) = React.useState(() => None)
  let (serviceability: option<bool>, setServiceability) = React.useState(() => None)

  let fetchServiceability = (
    ~lat: float,
    ~lon: float,
    ~type_: serviceabilityType,
    ~placeName: GetPlaceNameApi.placeName,
    ~item: LocationTypes.location,
  ): unit => {
    let url = switch type_ {
    | Origin => ApiRoutes.apiRoutes.serviceability("origin")
    | Destination => ApiRoutes.apiRoutes.serviceability("destination")
    }

    let body = ServiceabilityApi.mkCheckServiceableReq(lat, lon)->ServiceabilityApi.toJson

    ApiCall.callPostAPI(
      ~url,
      ~body,
      ~onSuccess={
        resp => {
          let serviceable = ServiceabilityApi.jsonToServiceabilityApiResType(resp)
          let description = placeName.formattedAddress
          let (heading: option<string>, subHeading: option<string>) = if (
            item.title == None && item.subtitle == None
          ) {
            LocationUtils.getLocationHeadings(description)
          } else {
            (item.title, item.subtitle)
          }
          let newLocation: LocationTypes.location = {
            lat: Some(lat),
            lng: Some(lon),
            placeId: item.placeId,
            title: heading,
            hotSpotInfo: None,
            subtitle: subHeading,
            formattedAddress: Some(placeName.formattedAddress),
            tag: item.tag,
            specialLocation: serviceable.specialLocation,
            addressComponents: Some(
              LocationUtils.getAddressFromComponents(
                placeName.formattedAddress,
                item.placeId,
                Some(placeName.addressComponents),
              ),
            ),
            serviceable: Some(serviceable.serviceable),
            serviceabilityCity: Some(serviceable.city),
            locationType: None,
            distanceFromCurrentLocation: None,
          }
          setServiceability(_ => Some(serviceable.serviceable))
          setLocation(_ => Some(newLocation))
        }
      },
      ~onError={
        err => {
          Console.log2("Serviceability API error", err)
        }
      },
    )->ignore
  }

  @genType
  let fetchPlaceName = (
    ~getBy: GetPlaceNameApi.getPlaceNameByEnum,
    ~item: LocationTypes.location,
    ~activeIndex: int,
  ): unit => {
    let getPlaceNameReq = GetPlaceNameApi.getPlaceNameRequest({
      getBy,
      language: "ENGLISH",
      sessionToken: "default-session-token",
    })->GetPlaceNameApi.toJson
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.getPlaceName,
      ~body=getPlaceNameReq,
      ~onSuccess={
        resp => {
          let mappedResp: GetPlaceNameApi.placeNameResp = GetPlaceNameApi.itemToObjectMapper(resp)
          switch mappedResp->Array.get(0) {
          | Some(placeName) =>
            switch placeName.location {
            | Some(location) =>
              fetchServiceability(
                ~lat=Option.getOr(item.lat, location.lat),
                ~lon=Option.getOr(item.lng, location.lon),
                ~type_=if activeIndex == 0 {
                  Origin
                } else {
                  Destination
                },
                ~placeName,
                ~item,
              )
            | None => Console.warn2("Error in fetchPlaceName", "Location is null")
            }
          | None => Console.warn2("Error in fetchPlaceName", "PlaceName is null")
          }
        }
      },
      ~onError={
        err => {
          Console.log2("fetchPlaceName error", err)
        }
      },
    )->ignore
  }

  let fetchLocationAndServiceability = (item: LocationTypes.location, activeIndex: int): unit => {
    switch item.placeId {
    | Some(placeId) => {
        let getBy = GetPlaceNameApi.PlaceByPlaceId({
          GetPlaceNameApi.contents: placeId,
          tag: "ByPlaceId",
        })
        fetchPlaceName(~getBy, ~item, ~activeIndex)
      }
    | None =>
      switch (item.lat, item.lng) {
      | (Some(lat), Some(lng)) => {
          let getBy = GetPlaceNameApi.PlaceByLatLon({
            GetPlaceNameApi.contents: {lat, lon: lng},
            tag: "ByLatLong",
          })
          fetchPlaceName(~getBy, ~item, ~activeIndex)
        }
      | (_, _) =>
        Console.log2("Error in fetchLocationAndServiceability", "Lat , Lng and PlaceId are null")
      }
    }
  }

  (location, setLocation, serviceability, fetchLocationAndServiceability)
}
