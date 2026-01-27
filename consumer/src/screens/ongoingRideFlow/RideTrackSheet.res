open ReactNative
open Style
open Tailwind
open Reanimated
open Utils
open ReactNavigation
type pollingInfoType = {
  mutable enable: bool,
  mutable id: string,
}

@react.component
let make = (
  ~navigation,
  ~currentSnapPoint,
  ~topComponentHeight,
  ~setPickupDistance,
  ~setPickpDistanceUnit,
  ~pickupDistance,
  ~pickupDistanceUnit,
  ~setDriverTravelledDist,
) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let isRideStarted = rideFlowState.stage == RideStarted
  let isFocused = Native.useIsFocused()
  let (chatArray, setChatArray) = React.useState(_ => [])
  let (notificationVal, _) = React.useContext(ReactNotificationContext.reactNotificationContext)
  let (animation, setAnimation) = React.useState(() => true)
  let translateY = useSharedValue(100.0)
  let translateX = useSharedValue(0.0)
  let (bandWidth, setWidth) = React.useState(_ => 0.)

  let animatedStyle = useAnimatedStyle(() =>
    viewStyle(
      ~transform=[
        ReactNative.Style.translateY(
          ~translateY=withTiming(~toValue=translateY.value, ~userOption={duration: 350.}),
        ),
      ],
      (),
    )
  )

  let animatedStyleForDismiss = useAnimatedStyle(() =>
    viewStyle(
      ~transform=[
        ReactNative.Style.translateX(
          ~translateX=withTiming(~toValue=translateX.value, ~userOption={duration: 0.}),
        ),
      ],
      (),
    )
  )

  let gesture =
    Gesture.makePan()
    ->Pan.onChange(onChangeArg => {translateX.value = onChangeArg.translationX})
    ->Pan.onEnd((_, _) => {
      if translateX.value < bandWidth *. -0.2 {
        translateX.value = withTiming(~toValue=-500., ~userOption={duration: 350.})
        translateY.value = 100.
      } else if translateX.value > bandWidth *. 0.2 {
        translateX.value = withTiming(~toValue=500., ~userOption={duration: 350.})
        translateY.value = 100.
      } else {
        translateX.value = withTiming(~toValue=0.0, ~userOption={duration: 100.})
      }
    })

  let goToChatScreen = _ => {
    setAnimation(_ => true)
    setChatArray(_ => [])
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.userChatScreen,
      {
        "pickUpDistance": pickupDistance,
        "pickUpDistanceUnit": pickupDistanceUnit,
      },
    )
  }

  React.useEffect(() => {
    if isFocused && !isRideStarted {
      let json =
        notificationVal.notification_json != ""
          ? notificationVal.notification_json->getDictfromJsonString
          : None
      let notificationType = notificationVal.notification_type
      switch json {
      | Some(jsonObj) =>
        switch jsonObj->Dict.get("body") {
        | Some(body) =>
          notificationType == "CHAT_MESSAGE"
            ? setChatArray(v => Array.concat(v, [body->getStringFromJson("")]))
            : ()
        | None => ()
        }
      | None => Console.log("Can't Parse JSON")
      }
    }
    None
  }, [notificationVal])

  React.useEffect(() => {
    if Array.length(chatArray) != 0 {
      if animation {
        setAnimation(_ => false)
      } else {
        setAnimation(_ => true)
        setTimeout(() => {
          if Array.length(chatArray) > 1 {
            let _ = Array.shift(chatArray)
          }
          setAnimation(_ => false)
        }, 350)->ignore
      }
    }
    None
  }, [chatArray])

  React.useEffect(() => {
    if animation || isRideStarted {
      translateY.value = 100.
    } else {
      translateY.value = 0.
    }
    None
  }, [animation, isRideStarted])

  let (rideFlowState, shareRide, setCancelRideStage) = UseOngoingRideDetail.useRideDetail(
    navigation,
    currentSnapPoint,
    topComponentHeight,
    ~setPickupDistance=?Some(setPickupDistance),
    ~setPickpDistanceUnit=?Some(setPickpDistanceUnit),
    ~setDriverTravelledDist={setDriverTravelledDist},
  )

  BackPress.hardwareBackPress(Minimize)
  <ReanimatedView>
    <TouchableHighlight
      onPress=goToChatScreen disabled={Array.length(chatArray) == 0} underlayColor="transparent">
      <GestureDetector gesture={Gesture.pan(gesture)}>
        <ReanimatedView
          onLayout={e => {
            let width = e.nativeEvent.layout.width
            setWidth(_ => width)
          }}
          style={array([
            tw(
              Array.length(chatArray) != 0
                ? "rounded-[23px] h-46px bg-fillInfoHigh mx-15px mb-8px flex-row py-8px px-10px gap-10px items-center"
                : "mb-8px",
            ),
            animatedStyle,
            animatedStyleForDismiss,
          ])}>
          <Svg.SvgXml xml=UserIcon.svg2 width="34px" height="30px" />
          <View style={tw("flex-1")}>
            <TextWrapper
              text={CUSTOM_TEXT({text: chatArray[0]->Option.getOr("")})}
              textType={Body_600}
              color=ThemebasedStyle.colorClass.textWhite
              overRideStyle={tw("")}
            />
          </View>
          <Svg.SvgXml xml=MessageGo.svg height="16px" width="14px" />
        </ReanimatedView>
      </GestureDetector>
    </TouchableHighlight>
    <View style={viewStyle(~height=100.->pct, ())}>
      <DriverProfileView rideFlowState navigation goToChatScreen />
      <GorhomBottomSheet.BottomSheetScrollView
        style={viewStyle(
          ~height=100.->pct,
          ~borderTopLeftRadius=16.,
          ~borderTopRightRadius=16.,
          ~backgroundColor=ThemebasedStyle.colorString.fillPrimaryMid,
          (),
        )}
        showsVerticalScrollIndicator=false>
        <TripDetails navigation currentSnapPoint rideFlowState setCancelRideStage shareRide />
      </GorhomBottomSheet.BottomSheetScrollView>
    </View>
  </ReanimatedView>
}
