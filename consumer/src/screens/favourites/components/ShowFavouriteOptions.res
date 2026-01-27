open Reanimated
open ReactNavigation
open Tailwind

@react.component
let make = (
  ~navigation,
  ~dropLocation: option<LocationTypes.location>,
  ~oneClickRideFlow: LocationTypes.location => unit,
  ~setShowOptions: (bool => bool) => unit,
  ~handleDeleteFav: unit => unit,
) => {
  let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)
  let isButtonDisabled =
    Option.isNone(dropLocation) ||
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted => true
    | _ => false
    }
  let handleBookRidePress = (_: ReactNative.Event.pressEvent) => {
    dropLocation->Utils.mapWithUnit(dropLocation => {
      oneClickRideFlow(dropLocation)
      Core.Navigation.goBack(navigation, ())
      rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.ConfirmPickup))
    })
  }

  <GorhomBottomSheet.BottomSheetView>
    <ReanimatedView style={tw("mx-4 pt-6 border-b-[1px] border-borderNeutralMid pb-6")}>
      <FullWidthButton
        isButtonDisabled
        handlePress={handleBookRidePress}
        bgColor=ThemebasedStyle.colorString.fillPrimaryHigh
        text=GetLocale.getLocale(BOOK_A_RIDE_NOW).text
      />
    </ReanimatedView>
    <ReanimatedView style={tw("px-4 pt-6")}>
      <FullWidthButton
        bgColor=ThemebasedStyle.colorString.fillNeutralLow
        textColor=ThemebasedStyle.colorString.textBlack
        text=GetLocale.getLocale(EDIT).text
        handlePress={_ => {
          setShowOptions(_ => false)
        }}
      />
    </ReanimatedView>
    <ReanimatedView style={tw("px-4 pt-3")}>
      <FullWidthButton
        handlePress={_ => {
          handleDeleteFav()
        }}
        isDestructive=true
        noBackgroundColor=true
        text=GetLocale.getLocale(DELETE_FAVOURITE).text
      />
    </ReanimatedView>
  </GorhomBottomSheet.BottomSheetView>
}
