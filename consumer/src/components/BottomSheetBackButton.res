open ReactNative
open Style

module BottomSheetBackIcon = {
  @react.component
  let make = (~chooseRideHeight, ~stage, ~isAndroid, ~estimateLoaded) => {
    let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)

    let opacity = Reanimated.useSharedValue(0.0)

    let animatedStyle = Reanimated.useAnimatedStyle(() => {
      viewStyle(
        ~opacity=Reanimated.withTiming(~toValue=opacity.value, ~userOption={duration: 600.}),
        (),
      )
    })
    let derivedBackPositionValue = Reanimated.useDerivedValue(() => {
      switch stage {
      | RideFlowContext.ConfirmPickup => 0.
      | RideFlowContext.ConfirmSpecialPickup => 1.
      | _ => 2.
      }
    })

    let animatedBackIconPosition = Reanimated.useAnimatedStyle1(() => {
      viewStyle(
        ~bottom=Reanimated.withTiming(
          ~toValue=Reanimated.interpolate(
            derivedBackPositionValue.value,
            [0., 1., 2.],
            [260., 360., chooseRideHeight],
            None,
          ) -. {
            isAndroid ? estimateLoaded && derivedBackPositionValue.value == 2. ? 40. : 20. : 0.
          },
          ~userOption={duration: 250.},
        )->dp,
        (),
      )
    }, [chooseRideHeight])
    let backpress = () => {
      switch rideFlowState.stage {
      | RideFlowContext.Search(_) => rideFlowAction(UpdateStage(RideFlowContext.HomeScreen))
      | RideFlowContext.ConfirmPickup | RideFlowContext.ConfirmSpecialPickup =>
        rideFlowAction(UpdateStage(RideFlowContext.Search(1)))
      | RideFlowContext.ChooseYourRide => rideFlowAction(UpdateStage(RideFlowContext.ConfirmPickup))
      | _ => ()
      }
    }

    React.useEffect(() => {
      opacity.value = 1.0
      Some(
        () => {
          opacity.value = 1.0
        },
      )
    }, [])

    let containerStyle = viewStyle(~position=#absolute, ~left=15.->dp, ())
    let buttonStyle = viewStyle(
      ~justifyContent=#center,
      ~alignItems=#center,
      ~height=35.->dp,
      ~borderRadius=17.5,
      ~width=47.->dp,
      ~backgroundColor=ThemebasedStyle.colorString.textMid,
      (),
    )
    let imageStyle = viewStyle(~width=13.->dp, ~height=13.->dp, ())

    <Reanimated.ReanimatedView
      style={array([containerStyle, animatedStyle, animatedBackIconPosition])}>
      <PressableComponent onPress={_ => backpress()} style={array([buttonStyle])}>
        <Image
          source={Image.Source.fromRequired(
            Packager.require("../resources/assets/png/left_arrow.png"),
          )}
          style={imageStyle}
        />
      </PressableComponent>
    </Reanimated.ReanimatedView>
  }
}
