open ReactQuery
open ReactNative
open SavedLocationType
open Style

type postSavedLocationBody = {
  placeId: option<string>,
  location: option<LocationTypes.location>,
  tag: string,
  description: string,
}
type putSavedLocationBody = {
  placeId: option<string>,
  location: option<LocationTypes.location>,
  tag: string,
  deleteTag: string,
  description: string,
}

// module Keys = {
//   let all = ["savedlocations"]
//   let post = [...all, "post"]
//   let delete = [...all, "delete"]
//   let put = [...all, "put"]
// }

let fetchPrefixImg = (tag: SavedLocationType.savedLocTag) => {
  switch tag {
  | FAV(loc) =>
    switch loc {
    | "Home" => HomeWhite.svg
    | "Work" => WorkWhite.svg
    | _ => Favourite.svg
    }
  | ADD_HOME => HomeWhite.svg
  | ADD_WORK => WorkWhite.svg
  }
}

let getSavedLocation = (
  savedLocation: array<SavedReqLocationAPIEntity.savedReqLocationAPIEntity>,
) => {
  Console.log2("Inside savedLocation", savedLocation)
  savedLocation->Array.map(item => {
    let description = LocationUtils.fetchLocationInfo(SavedLoc(item))
    let (heading, subHeading) = LocationUtils.getLocationHeadings(description.address)
    {
      tag: FAV(item.tag),
      SavedLocationType.locationData: Some({
        lat: Some(item.lat),
        lng: Some(item.lon),
        placeId: item.placeId,
        title: heading,
        subtitle: subHeading,
        tag: FAVOURITES(item.tag),
        serviceable: None,
        serviceabilityCity: None,
        addressComponents: None,
        hotSpotInfo: None,
        formattedAddress: None,
        specialLocation: None,
        locationType: None,
        distanceFromCurrentLocation: None,
      }),
    }
  })
}

let transformedSavedLocData = (data: array<SavedLocationType.savedLocType>): array<
  SavedLocationType.tagConfig,
> => {
  data->Array.map((item): SavedLocationType.tagConfig => {
    let tag = switch item.tag {
    | FAV(fav) =>
      switch fav->String.toLowerCase {
      | "home" | "work" => ""
      | _ => fav
      }
    | ADD_HOME => "Add Home"
    | ADD_WORK => "Add Work"
    }
    {
      text: tag,
      prefixImg: fetchPrefixImg(item.tag),
      componentType: {Dark},
      paddingHorizontal: "10",
      paddingVertical: "6",
      tag: item.tag,
      locationData: item.locationData,
    }
  })
}

let findTag = (tagToFind: string, savedLocation: array<SavedLocationType.savedLocType>) => {
  Array.find(savedLocation, loc => {
    let savedTag = switch loc.tag {
    | FAV(tag) => tag
    | _ => ""
    }
    savedTag->String.toLowerCase == tagToFind->String.toLowerCase
  })
}

let removeDefaultTags = (savedLocation: array<SavedLocationType.savedLocType>) => {
  Array.filter(savedLocation, item => {
    switch item.tag {
    | FAV(fav) => fav->String.toLowerCase != "home" && fav->String.toLowerCase != "work"
    | _ => true
    }
  })
}

let fetchOptionTag = (tag, optionTag, savedLocation: array<SavedLocationType.savedLocType>) => {
  switch findTag(tag, savedLocation) {
  | Some(location) => [location]
  | None => [{tag: optionTag, locationData: None}]
  }
}

let transformData = resp => {
  let savedLocation =
    SavedReqLocationsListRes.decodeSavedReqLocationsListRes(resp->Utils.asJson)->Result.getExn
  let savedLocList = getSavedLocation(savedLocation.list)
  let customSavedLocs = removeDefaultTags(savedLocList)
  let transformedData: array<SavedLocationType.tagConfig> = transformedSavedLocData(
    Array.concat(
      fetchOptionTag("Home", ADD_HOME, savedLocList),
      Array.concat(fetchOptionTag("Work", ADD_WORK, savedLocList), customSavedLocs),
    ),
  )
  transformedData
}

let favouriteList: array<FavouriteFlowTypes.favouriteListType> = [
  {
    title: "Home",
    icon: (~fill: string) => <IconWrapper size="h-5" icon={() => <HomeIcon fill={fill} />} />,
    favTag: HOME,
  },
  {
    title: "Work",
    icon: (~fill: string) => <IconWrapper size="h-5" icon={() => <WorkIcon fill={fill} />} />,
    favTag: WORK,
  },
  {
    title: "Others",
    icon: (~fill: string) => <IconWrapper size="h-5" icon={() => <HeartIcon fill={fill} />} />,
    favTag: OTHERS,
  },
]

let transformToFavorites = (
  tagConfigList: array<SavedLocationType.tagConfig>,
  variant: FavouriteFlowTypes.variant,
  val: FavouriteContext.favouriteContextType,
): array<FavouriteFlowTypes.listItemType> => {
  let transformedList =
    tagConfigList->Array.map((
      before: SavedLocationType.tagConfig,
    ): FavouriteFlowTypes.listItemType => {
      let (
        locationTitle,
        locationIcon,
        variant,
        placeId,
        fill,
        uiTitle,
        savedLocTag,
      ) = SavedLocationHelper.getListItemType(before, favouriteList, variant)
      let locationIcon = locationIcon->Option.map(icon => icon.icon(~fill))
      let locationAddress = SavedLocationHelper.getShortLocationAddress(before)
      {
        locationTitle,
        locationAddress,
        locationIcon,
        variant,
        placeId,
        savedLocTag,
        uiTitle,
        handlePress: () =>
          SavedLocationHelper.modifyContextState(val, before, favouriteList, variant),
      }
    })
  variant == DEFAULT
    ? transformedList->Array.filter(item => item.variant == DEFAULT)
    : transformedList->Array.filter(item => item.variant == FAVORITES)
}

let fetchSavedLocations = async () => {
  let data = await ApiCall.callGetAPI'(~url=ApiRoutes.apiRoutes.savedLocationList)
  let transformedData = transformData(data)
  transformedData
}

let encodeAndPostSavedLocation = (
  description: string,
  addressComponents: array<GetPlaceNameApi.addressComponents>,
  tag: string,
  placeId: option<string>,
  lat: float,
  lon: float,
) => {
  let postBody = LocationUtils.encodeAddressDescription(
    ~description,
    ~addressComponents,
    ~tag,
    ~placeId,
    ~lat,
    ~lon,
  )
  postBody->Utils.asJson
}

let postSavedLocation = async (requestBody: postSavedLocationBody) => {
  let transformLatAndLong = resp => {
    let latAndLon = GetPlaceDetailsApi.itemToObjectMapper(resp)
    latAndLon
  }
  switch requestBody.placeId {
  | Some(_) => {
      let getPlaceDetailsReq: GetPlaceDetailsApi.getPlaceDetailsReq = {
        placeId: Option.getOr(requestBody.placeId, ""),
        sessionToken: "default-session-token",
      }
      let latAndLong = await ApiCall.callPostAPI'(
        ~url=ApiRoutes.apiRoutes.getPlaceDetails,
        ~body=getPlaceDetailsReq->GetPlaceDetailsApi.toJson,
      )
      let latAndLong = transformLatAndLong(latAndLong)
      let placeName = await ApiCall.callPostAPI'(
        ~url=ApiRoutes.apiRoutes.getPlaceName,
        ~body=GetPlaceNameApi.getPlaceNameRequest({
          getBy: GetPlaceNameApi.PlaceByPlaceId({
            contents: Option.getOr(requestBody.placeId, ""),
            tag: "ByPlaceId",
          }),
          language: "ENGLISH",
          sessionToken: "default-session-token",
        })->GetPlaceNameApi.toJson,
      )
      let placeName = GetPlaceNameApi.itemToObjectMapper(placeName)
      switch placeName->Array.get(0) {
      | Some(placeNameResp) =>
        switch latAndLong.location {
        | Some(location) =>
          let data = encodeAndPostSavedLocation(
            requestBody.description,
            placeNameResp.addressComponents,
            requestBody.tag,
            requestBody.placeId,
            location.lat,
            location.lon,
          )
          data
        | None =>
          Console.error("Unable to parse latAndLong")
          Js.Json.Null
        }
      | None =>
        Console.log("Unable to parse placeNameResp")
        Js.Json.Null
      }
    }
  | None => {
      let location = requestBody.location
      switch location {
      | Some(location) =>
        switch (location.lat, location.lng) {
        | (Some(lat), Some(lng)) => {
            let placeName = await ApiCall.callPostAPI'(
              ~url=ApiRoutes.apiRoutes.getPlaceName,
              ~body=GetPlaceNameApi.getPlaceNameRequest({
                getBy: GetPlaceNameApi.PlaceByLatLon({
                  contents: {
                    lat,
                    lon: lng,
                  },
                  tag: "ByLatLong",
                }),
                language: "ENGLISH",
                sessionToken: "default-session-token",
              })->GetPlaceNameApi.toJson,
            )
            let placeName = GetPlaceNameApi.itemToObjectMapper(placeName)
            switch placeName->Array.get(0) {
            | Some(placeNameResp) =>
              let data = encodeAndPostSavedLocation(
                requestBody.description,
                placeNameResp.addressComponents,
                requestBody.tag,
                placeNameResp.placeId,
                lat,
                lng,
              )
              data
            | None =>
              Console.log("Unable to parse placeNameResp")
              Js.Json.Null
            }
          }
        | _ =>
          Console.log("Unable to parse lat and long")
          Js.Json.Null
        }
      | None =>
        Console.log("Unable to parse placeId and location")
        Js.Json.Null
      }
    }
  }
}
let deleteSavedLocation = async (tag: string) => {
  let data = await ApiCall.callDeleteAPI'(~url=ApiRoutes.apiRoutes.savedLocation ++ "/" ++ tag)
  data
}

let updateSavedLocation = async (requestBody: putSavedLocationBody): Js_json.t => {
  let _ = await deleteSavedLocation(requestBody.deleteTag)
  let requestBody: postSavedLocationBody = {
    placeId: requestBody.placeId,
    location: requestBody.location,
    tag: requestBody.tag,
    description: requestBody.description,
  }
  // await postSavedLocation(requestBody)
  let data = await postSavedLocation(requestBody)
  let reqBody =
    CreateSavedReqLocationReq.decodeCreateSavedReqLocationReq(data->Utils.asJson)->Result.getExn
  let _ = await SavedLocationPost.savedLocationPostApiCall(reqBody)
  reqBody->Utils.asJson
}

let useUpdateSavedLocation = (~mutationKey) => {
  let queryClient = useQueryClient()
  useMutation({
    mutationKey,
    mutationFn: body => updateSavedLocation(body),
    onSettled: async (_, _, _, _) => {
      await queryClient.invalidateQueries(Some({queryKey: SavedLocationListGetRQ.Keys.all}), None)
    },
  })
}

let useSavedLocationPost = (~mutationKey) => {
  let queryClient = useQueryClient()
  useMutation({
    mutationKey,
    mutationFn: (body: CreateSavedReqLocationReq.createSavedReqLocationReq) =>
      SavedLocationPost.savedLocationPostApiCall(
        (body: CreateSavedReqLocationReq.createSavedReqLocationReq),
      ),
    onSettled: async (_, _, _, _) => {
      await queryClient.invalidateQueries(Some({queryKey: SavedLocationListGetRQ.Keys.all}), None)
    },
  })
}
let useSavedLocationTagDelete = (~mutationKey) => {
  let queryClient = useQueryClient()
  useMutation({
    mutationKey,
    mutationFn: (tag: string) =>
      SavedLocationTagDelete.savedLocationTagDeleteApiCall((tag: string)),
    onSettled: async (_, _, _, _) => {
      await queryClient.invalidateQueries(Some({queryKey: SavedLocationListGetRQ.Keys.all}), None)
    },
  })
}

let useSavedLocationPost = (~mutationKey) => {
  let queryClient = useQueryClient()
  useMutation({
    mutationKey,
    mutationFn: (body: CreateSavedReqLocationReq.createSavedReqLocationReq) =>
      SavedLocationPost.savedLocationPostApiCall(
        (body: CreateSavedReqLocationReq.createSavedReqLocationReq),
      ),
    onSettled: async (_, _, _, _) => {
      await queryClient.invalidateQueries(Some({queryKey: SavedLocationListGetRQ.Keys.all}), None)
    },
  })
}
let useSavedLocationListGet = (~queryKey) => {
  useQuery({
    queryKey,
    queryFn: _ => SavedLocationListGet.savedLocationListGetApiCall(),
  })
}
