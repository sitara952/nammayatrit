open Reanimated
open ReactNative
open Tailwind
open Style
open FavouriteFlowTypes

@react.component
let make = (~setLocation, ~favContext: FavouriteContext.favouriteContextType) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let currentLocation = rideFlowState.currentLocation

  let addCurrentLocationPress = (_: ReactNative.Event.pressEvent) => {
    setLocation(_ => currentLocation)
    currentLocation->Utils.mapWithUnit(currentLocationData => {
      favContext.setInputForm(inputForm => {
        ...inputForm,
        address: Option.getOr(currentLocationData.formattedAddress, ""),
        placeId: currentLocationData.placeId,
      })
      favContext.setAddFavouriteFromSearch(_ => false)
      favContext.setShowOptions(_ => false)
      favContext.setIsEditFavourite(_ => false)
      favContext.setSearchTextInput(_ => LocationUtils.getTitleSubtitle(currentLocationData))
      favContext.setDescription(_ => LocationUtils.getTitleSubtitle(currentLocationData))
      BottomSheetWrapper.collapseBottomSheet(favContext.addFavouriteBottomsheetRef)
    })
  }

  <ReanimatedView entering=Reanimated.fadeIn exiting=Reanimated.fadeOut style={tw("mt-6")}>
    <TextWrapper
      text={CURRENT_LOCATION} textType=Body_800 overRideStyle={tw("text-textHigh px-4")}
    />
    <ReanimatedView
      style={array([
        tw("border-[1px] border-ctaSecondaryPressed rounded-[14px] bg-white mt-4 mx-4"),
        viewStyle(
          ~shadowColor="#00000040",
          ~shadowOffset=offset(~height=0.15, ~width=0.),
          ~shadowRadius=12.,
          ~shadowOpacity=0.15,
          ~elevation=2.,
          (),
        ),
      ])}>
      <Pressable
        style={interactionState =>
          array([
            tw("px-4"),
            interactionState.pressed ? tw(`bg-borderNeutralLow rounded-[13px]`) : tw(""),
          ])}>
        {_ =>
          <TouchableOpacity onPress={addCurrentLocationPress}>
            <ReanimatedView style={array([tw("py-4")])}>
              <ReanimatedView style={tw("flex flex-row items-center justify-between")}>
                <ReanimatedView style={tw("flex-row items-start max-w-11/12")}>
                  <IconWrapper
                    icon={() =>
                      <LocationPinIcon fill=ThemebasedStyle.colorString.fillPrimaryHigh />}
                    size="h-4"
                  />
                  {switch currentLocation {
                  | Some(currentLocation) =>
                    <ReanimatedView style={tw("pl-3")}>
                      <TextWrapper
                        truncate={Blur}
                        text={CUSTOM_TEXT({
                          text: Option.getOr(currentLocation.title, ""),
                        })}
                        textType={SHead_800}
                        overRideStyle={tw("text-textPrimary")}
                      />
                      <Text numberOfLines={1} style={tw("text-textHigh pt-1")}>
                        {React.string(Option.getOr(currentLocation.subtitle, ""))}
                      </Text>
                    </ReanimatedView>
                  | None => React.null
                  }}
                </ReanimatedView>
                <ReanimatedView
                  style={array([
                    tw(
                      "h-6 w-9 rounded-[100px] justify-center items-center border-[1px] border-borderPrimaryHigh",
                    ),
                  ])}>
                  <IconWrapper
                    icon={() => <AddIcon fill=ThemebasedStyle.colorString.fillPrimaryHigh />}
                    size="h-4"
                  />
                </ReanimatedView>
              </ReanimatedView>
            </ReanimatedView>
          </TouchableOpacity>}
      </Pressable>
    </ReanimatedView>
  </ReanimatedView>
}
