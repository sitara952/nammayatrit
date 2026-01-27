open ReactNative
open Style
open Constants
open Utils

@react.component
let make = (~inputVal, ~onClick, ~index) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let inputVal = Utils.useDebounce(debounce_delay, Option.getOr(inputVal, " "))
  let {mutate, data: apiRespData} = AutoComplete.useMapsAutoCompletePost(
    ~mutationKey=MapsAutoCompletePostRQ.Keys.all,
  )
  let (predictionList, setPredictionList) = React.useState(_ => None)

  let constructBodyAndCallApi = async () => {
    let body = await AutoComplete.mkAutoCompleteReq(
      ~input=inputVal,
      ~currentLocation=rideFlowState.currentLocation,
    )
    mutate(body, None)
  }
  let autoCompletePredictions = AutoComplete.transformApiData(~data=apiRespData)

  React.useEffect(() => {
    if autoCompletePredictions != [] {
      setPredictionList(_ => Some(autoCompletePredictions))
    }
    None
  }, [autoCompletePredictions])

  let constructInputVal = (location: option<LocationTypes.location>) => {
    switch location {
    | Some(loc) =>
      switch (loc.title, loc.subtitle) {
      | (Some(title), Some(subtitle)) => Some(title ++ ", " ++ subtitle)
      | (Some(title), None) => Some(title)
      | (None, Some(subtitle)) => Some(subtitle)
      | _ => None
      }
    | None => None
    }
  }

  let modifiedRecents: array<AutoComplete.autoCompleteItem> =
    rideFlowState.recentSearches
    ->Option.getOr([])
    ->Array.map(item => {
      let calculatedDistance = switch rideFlowState.currentLocation {
      | Some(loc) =>
        switch (loc.lat, loc.lng, item.lat, item.lng) {
        | (Some(lat1), Some(lng1), Some(lat2), Some(lng2)) =>
          Some(haversineDistance(lat1, lng1, lat2, lng2))
        | _ => None
        }
      | None => None
      }

      let commonProps = {
        AutoComplete.prefixImage: HotelSearch.svg,
        locationData: Some(item),
        postfixViewType: NoIcon,
        postfixText: "",
      }

      switch calculatedDistance {
      | Some(dist) => {
          ...commonProps,
          postfixViewType: Text,
          postfixText: Float.toFixed(dist, ~digits=1) ++ " km",
        }
      | None => commonProps
      }
    })

  let (
    location: option<LocationTypes.location>,
    _,
    _,
    fetchLocationAndServiceability,
  ) = UseLocationDetails.useLocationDetails()

  let getCurrentLocation: array<
    AutoComplete.autoCompleteItem,
  > = switch rideFlowState.currentLocation {
  | Some(loc) => [
      {
        prefixImage: LocationPin.svg,
        locationData: Some(loc),
        postfixViewType: Text,
        postfixText: "0.0 km",
      },
    ]
  | None => []
  }

  React.useEffect1(() => {
    onClick(index, location)
    None
  }, [location])

  React.useEffect1(() => {
    if String.length(inputVal) >= 3 {
      constructBodyAndCallApi()->ignore
    } else if String.length(inputVal) == 0 {
      setPredictionList(_ => None)
    }
    None
  }, [inputVal])

  let shouldShowCurrentLocation = index == 0 && Option.getOr(predictionList, [])->Array.length == 0

  <View style={viewStyle(~flex=1., ())}>
    <FlatList
      data={Option.getOr(predictionList, [])->Array.length == 0
        ? shouldShowCurrentLocation ? getCurrentLocation : modifiedRecents
        : AutoComplete.constructSearchListData(~predictionList=predictionList->Option.getOr([]))}
      horizontal=false
      keyboardShouldPersistTaps={#handled}
      keyExtractor={(_, i) => i->Int.toString}
      renderItem={({item}) => <>
        {switch item.locationData {
        | Some(locData) =>
          <>
            <SearchListItem
              onPress={_ => {
                index == 0
                  ? setRideSearchData({
                      ...rideSearchData,
                      sourceSetUsingPin: false,
                      source: item.locationData,
                    })
                  : setRideSearchData({
                      ...rideSearchData,
                      destSet: true,
                      destination: item.locationData,
                    })
                fetchLocationAndServiceability(locData, index)
              }}
              heading={shouldShowCurrentLocation ? Some("Current Location") : locData.title}
              subHeading={shouldShowCurrentLocation
                ? constructInputVal(Some(locData))
                : locData.subtitle}
              prefixImage=item.prefixImage
              postfixViewType=item.postfixViewType
              postfixText=item.postfixText
              backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite
              borderColor=ThemebasedStyle.colorString.borderNeutralMid
              location=item.locationData
              postfixViewAlignment={#center}
              paddingHorizontal={0.->dp}
            />
          </>
        | None => React.null
        }}
      </>}
    />
  </View>
}
