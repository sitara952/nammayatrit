open ReactNative
open Style
open Tailwind

@react.component
let make = (~bottomSheetHeight: float, ~setBottomSheetHeight, ~footerHeight) => {
  let (rideSearchContext, _setRideSearchData) = React.useContext(
    RideSearchContext.rideSearchContext,
  )
  let (estimateListHeight, setEstimateListHeight) = React.useState(_ => 100.)
  let (rideResults, loading, initiateRideSearch) = UseRideSearch.useRideSearch(
    footerHeight,
    estimateListHeight,
    setBottomSheetHeight,
  )
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let (isSelected, setIsSelected, _) = UseEstimateSelection.useEstimateSelection(
    rideResults,
    () => {
      rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.FindingRides))
    },
  )
  let selectedRide = Reanimated.useSharedValue(0)

  let onBackPressed = () => {
    rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.Search(1)))
    Console.log("Before animate camnera")
  }

  let estimateLayoutEvent = (layoutEvent: Event.layoutEvent) => {
    try {
      let height = layoutEvent.nativeEvent.layout.height
      if height != 0. && estimateListHeight != height {
        setEstimateListHeight(_ => height)
      }
    } catch {
    | error => Console.warn2("error in estimateLayoutEvent", error)
    }
  }

  BackPress.hardwareBackPress(OnPress(onBackPressed))
  React.useEffect1(() => {
    if !loading && Array.length(rideResults) == 0 {
      rideFlowAction(UpdateStage(RideFlowContext.ConfirmPickup))
    }
    None
  }, [loading])

  <ScreenWrapperWithSafeArearViewAndPadding
    backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite paddingHorizontal={0.0->dp}>
    <Stripe.StripeProvider publishableKey=Constants.stripePublishableKey>
      <View style={viewStyle(~paddingBottom=footerHeight->dp, ~height=100.->pct, ())}>
        <TextWrapper
          text={CHOOSE_YOUR_RIDE}
          color=ThemebasedStyle.colorClass.textBlack
          textType={SHead_700}
          overRideStyle={textStyle(~paddingHorizontal=16.->dp, ~paddingBottom=15.->dp, ())}
        />
        <GorhomBottomSheet.BottomSheetScrollView
          scrollEnabled={!loading}
          style={viewStyle(
            ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
            ~paddingVertical=0.->dp,
            ~flexDirection=#column,
            (),
          )}>
          <View
            style={viewStyle(
              ~flexDirection=#column,
              ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
              (),
            )}>
            {loading
              ? <View onLayout={layoutEvent => estimateLayoutEvent(layoutEvent)}>
                  <VehicleItemShimmer loading />
                  <VehicleItemShimmer loading />
                </View>
              : <View onLayout={layoutEvent => estimateLayoutEvent(layoutEvent)}>
                  {rideResults
                  ->Array.mapWithIndex((item, index) => {
                    <View key={Js.Int.toString(index)}>
                      <VehicleItem
                        title={item.title}
                        subtitle={Option.getOr(item.subtitle, "4")}
                        fare={item.fare}
                        capacity={item.capacity}
                        pickupTime={item.pickupTime}
                        estimateFareBreakup={item.estimateFareBreakup}
                        selectedRide
                        index
                        setIsSelected
                        isSelected={index == isSelected}
                        loading
                        estimatedDuration=item.estimatedDuration
                      />
                      <View style={tw("border-t border-borderNeutralMid mx-15px")} />
                    </View>
                  })
                  ->React.array}
                </View>}
          </View>
        </GorhomBottomSheet.BottomSheetScrollView>
      </View>
    </Stripe.StripeProvider>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
