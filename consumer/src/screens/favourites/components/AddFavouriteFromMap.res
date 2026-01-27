open ReactNative
open Tailwind

module ChooseLocationForFavourite = {
  @react.component
  let make = (
    ~setLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
    ~showMap: bool,
  ) => {
    let favContext = React.useContext(FavouriteContext.context)
    let currentLocation = React.useContext(WatchUserLocationContext.context)
    let handleBackButtonPress = (_: ReactNative.Event.pressEvent) => {
      favContext->Utils.mapWithUnit(favContext => {
        favContext.setShowMap(_ => false)
      })
    }

    let mapCenterView =
      <View style={tw(`w-full h-full flex items-center justify-center pb-5`)}>
        <Svg.SvgCss
          xml=LocateOnMapMarker.svg
          height=44.
          width=44.
          fill=ThemebasedStyle.colorString.fillPrimaryHigh
        />
      </View>

    let (
      location: option<LocationTypes.location>,
      setLocation',
      _,
      fetchLocationAndServiceability,
    ) = UseLocationDetails.useLocationDetails()

    let searchListItemOnPress = _ => ()
    let (selectedGateId, setSelectedGateId) = React.useState(_ => None)

    let extractAndTransformLocations = {
      switch location {
      | Some(source) => [source]
      | None => []
      }
    }

    let handleConfirmLocation = _ => {
      favContext->Utils.mapWithUnit(favContext => {
        favContext.setShowMap(_ => false)
        setLocation(_ => location)
        location->Utils.mapWithUnit(locationData => {
          favContext.setInputForm(
            inputForm => {
              ...inputForm,
              address: Option.getOr(locationData.formattedAddress, ""),
              placeId: locationData.placeId,
            },
          )
          favContext.setAddFavouriteFromSearch(_ => false)
          favContext.setShowOptions(_ => false)
          favContext.setSearchTextInput(_ => LocationUtils.getTitleSubtitle(locationData))
          favContext.setDescription(_ => LocationUtils.getTitleSubtitle(locationData))
          favContext.setLocation(_ => favContext.mapLocation)
          BottomSheetWrapper.collapseBottomSheet(favContext.addFavouriteBottomsheetRef)
          setLocation'(_ => None)
        })
      })
    }

    <LocationPickup
      viewStyle={!showMap ? tw("hidden") : tw("mt-auto bg-fillPrimaryMid p-3 py-4")}
      titleText=CONFIRM_LOCATION
      buttonText={GetLocale.getLocale(CONFIRM_LOCATION).text}
      selectedGateId
      setSelectedGateId
      handleSearchListItemPress=searchListItemOnPress
      locationList={extractAndTransformLocations}
      onPress={handleConfirmLocation}>
      <View style={tw("p-2")}>
        <PressableComponent
          onPress=handleBackButtonPress
          hitSlop={{bottom: 10., top: 10., left: 10., right: 10.}}
          style={tw("mb-2 mr-auto ml-2")}>
          <IconWrapper icon={() => <ArrowLeft />} size="h-4" />
        </PressableComponent>
      </View>
    </LocationPickup>
  }
}
@react.component
let make = (
  ~setLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
  ~showMap: bool,
) => {
  <ChooseLocationForFavourite setLocation showMap />
}
