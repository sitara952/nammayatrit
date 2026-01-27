open ReactNavigation
open ReactNative
open Style
open Tailwind

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let sheetIndex0 = Float.toString(Utils.dpToPercentageHeight(Platform.os == #ios ? 215. : 225.))
  let sheetIndex1 = Float.toString(Utils.dpToPercentageHeight(Platform.os == #ios ? 315. : 325.))
  let translateY = Reanimated.useSharedValue(-100.)
  let rideStatusRef = React.useRef(Nullable.null)
  let (animationEnd, setAnimationEnd) = React.useState(_ => false)
  let (topComponentHeight, setTopComponentHeight) = React.useState(_ => None)
  let (driverTravelledDist, setDriverTravelledDist) = React.useState(() => None)
  let (rideFlowState, _rideFlowAction) = React.useContext(RideFlowContext.context)
  let (pickupDistance, setPickupDistance) = React.useState(() => None)
  let (pickpDistanceUnit, setPickpDistanceUnit) = React.useState(() => Some(
    RouteAPI.defaultDistanceUnit,
  ))

  {
    switch pickupDistance {
    | Some(_) =>
      if translateY.value < 0. {
        translateY.value = Reanimated.withTimingWithCallback(
          ~toValue=0.0,
          ~userOption={duration: 1100.},
          ~callback=(_, _) => {
            Reanimated.runOnJS({
              setAnimationEnd
            })(_ => true)
          },
        )
      }
    | None => ()
    }
  }

  React.useEffect(() => {
    if translateY.value == 0.0 {
      switch Js.Nullable.toOption(rideStatusRef.current) {
      | Some(view) =>
        ReactNative.View.measureInWindow(view, (~x as _, ~y, ~width as _, ~height) => {
          setTopComponentHeight(_ => Some(Utils.dpToPercentageHeight(y +. height) +. 2.))
        })
      | None => ()
      }
    }
    None
  }, [animationEnd])
  <>
    {switch pickupDistance {
    | _ =>
      switch rideFlowState.rideDetail {
      | None => React.null
      | Some(rideDetailData) => {
          let destinationLocationInfo: TripDetails.addressCardData = {
            primaryAddress: rideDetailData.destinationLocationInfo.ward,
            secondaryAddress: rideDetailData.destinationLocationInfo.address,
          }
          let secondaryAddress = destinationLocationInfo.secondaryAddress

          <Reanimated.ReanimatedView style={tw({Platform.os == #ios ? "mt-11" : ""})}>
            <Reanimated.ReanimatedView
              entering={Reanimated.LayoutAnimation.duration(
                Reanimated.LayoutAnimation.slideInUp,
                1100.,
              )}
              ref={rideStatusRef->ReactNative.Ref.value}
              style={array([tw("z-1 absolute w-full  ")])}>
              {<RideStatusPill
                pickupDistance
                pickpDistanceUnit
                driverTravelledDist
                destinationLocationInfo={switch secondaryAddress {
                | Some(address) => CUSTOM_TEXT({text: address})
                | None => CUSTOM_TEXT({text: "default"})
                }}
              />}
              <Reanimated.ReanimatedView style={array([tw(" z-1 pl-4 pt-18 mt-16px absolute")])}>
                <Hamburger onPress={_ => Drawer.Navigation.toggleDrawer(navigation)} />
              </Reanimated.ReanimatedView>
            </Reanimated.ReanimatedView>
          </Reanimated.ReanimatedView>
        }
      }
    }}
    <BottomSheetWrapper
      showBottomSheetHandle=false
      backgroundColor="transparent"
      initialIndex=1.
      snapPoints=[sheetIndex0, sheetIndex1, "72%"]
      header={() => React.null}
      sheetComponent={(
        ~snapToIndex as _,
        ~handleClosePress as _,
        ~handleExpandPress as _,
        ~currentSnapPoint,
      ) => {
        <RideTrackSheet
          navigation
          currentSnapPoint
          topComponentHeight
          setPickupDistance={setPickupDistance}
          setPickpDistanceUnit={setPickpDistanceUnit}
          pickupDistance
          pickupDistanceUnit=pickpDistanceUnit
          setDriverTravelledDist={setDriverTravelledDist}
        />
      }}>
      {<> </>}
    </BottomSheetWrapper>
  </>
}
