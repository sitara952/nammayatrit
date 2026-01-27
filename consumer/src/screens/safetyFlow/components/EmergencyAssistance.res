open ReactNative
open Tailwind

@react.component
let make = (~vehicleDetail: RideTrackScreenType.vehicleDetail, ~closeSafetyModal) => {
  let currentLocation = React.useContext(WatchUserLocationContext.context)
  let (
    location: option<LocationTypes.location>,
    _,
    _,
    fetchLocationAndServiceability,
  ) = UseLocationDetails.useLocationDetails()

  React.useEffect(() => {
    switch currentLocation.position {
    | Some(location) => {
        let locationReq: LocationTypes.location = LocationUtils.createLocation(
          location.coords.latitude,
          location.coords.longitude,
        )
        fetchLocationAndServiceability(locationReq, 0)
      }
    | None => ()
    }
    None
  }, [])

  let emergencyDetailView = {
    <View style={tw(`my-1.5 p-4 rounded-md border-borderNeutralMid border-[1px]`)}>
      <View style={tw(`pb-5`)}>
        <TextWrapper
          overRideStyle={tw(`pb-1`)}
          color=ThemebasedStyle.colorClass.textBlack
          textType={SBody_600}
          text=YOUR_LATEST_LOCATION
        />
        {switch location {
        | Some(loc) =>
          switch loc.subtitle {
          | Some(subtitle) =>
            <TextWrapper
              overRideStyle={tw(``)}
              color=ThemebasedStyle.colorClass.textHigh
              textType={Body_400}
              text={CUSTOM_TEXT({text: subtitle})}
            />
          | None => <ShimmerView isLoading=true height="50" speed=1.0 />
          }
        | None => <ShimmerView isLoading=true height="50" speed=1.0 />
        }}
      </View>
      <View>
        <View>
          <TextWrapper
            overRideStyle={tw(`pb-1`)}
            color=ThemebasedStyle.colorClass.textBlack
            textType={SBody_600}
            text=YOUR_VEHICLE_INFO
          />
          <View style={tw(`flex-row justify-between`)}>
            <TextWrapper
              overRideStyle={tw(`self-center`)}
              color=ThemebasedStyle.colorClass.textHigh
              textType={Body_400}
              text={CUSTOM_TEXT({
                text: vehicleDetail.vehColor ++ " \u00b7 " ++ vehicleDetail.variant,
              })}
            />
            <View style={tw(`flex-row self-center`)}>
              <View style={tw("flex-row bg-fillNeutralLow rounded-3xl p-1 gap-1")}>
                <TextWrapper
                  overRideStyle={tw(`px-2`)}
                  color=ThemebasedStyle.colorClass.textBlack
                  textType={SHead_700}
                  text={CUSTOM_TEXT({text: vehicleDetail.vehicleNumber})}
                />
              </View>
            </View>
          </View>
          <Seperator margin=16. height=1. color="#E0E3E8" />
          <TextWrapper
            color=ThemebasedStyle.colorClass.textHigh
            textType={SBody_600}
            text=PLEASE_GIVE_THE_OPERATOR_YOUR_LOCATION
          />
        </View>
      </View>
    </View>
  }

  <PopUpModal
    popUpModalType=PopUpModal.PopUp2({
      title: EMERGENCY_ASSISTANCE,
      onClose: Some(closeSafetyModal),
      children: emergencyDetailView,
      button1: None,
      button2: Some({
        text: CALL("911"),
        backgroundColor: ThemebasedStyle.colorString.fillNegativeHigh,
        onPress: () => Linking.openURL("tel:" ++ Constants.emergencyContactNumber)->ignore,
      }),
    })
  />
}
