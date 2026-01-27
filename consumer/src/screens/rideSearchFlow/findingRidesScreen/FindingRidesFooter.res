open ReactNative
open Style
open LocaleStringType
open Tailwind
open Reanimated
open DayJs

@react.component
let make = (
  ~navigation as _,
  ~estimateId,
  ~timerId=React.useRef(None),
  ~clearTimer,
  ~percent,
  ~fixedDurationInSecond,
  ~counter,
  ~setCounter,
  ~isActive,
  ~setIsActive,
) => {
  let (currentIndex, setCurrentIndex) = React.useState(() => 0)
  let (currentRotatingData, setCurrentRotatingData) = React.useState(() =>
    FindingRidesData.getRotatingData("banglore", counter, "en")
  )

  let currentText = switch Belt.Array.get(currentRotatingData, currentIndex) {
  | Some(text) => text
  | None => ""
  }

  let (firstOpened, setFirstOpened) = React.useState(() => false)

  React.useEffect1(() => {
    setFirstOpened(_ => true)
    None
  }, [])

  // React.useEffect1(() => {
  //   if isActive {
  //     let intervalId = BackGroundTask.runBackgroundInterval(~task=() => {
  //       setCounter(
  //         prevCounter => {
  //           let newCounter = firstOpened ? counter : prevCounter + 5
  //           setCurrentRotatingData(
  //             _ => FindingRidesData.getRotatingData("banglore", newCounter, "en"),
  //           )
  //           setFirstOpened(_ => false)

  //           newCounter
  //         },
  //       )
  //       setCurrentIndex(
  //         prevIndex => prevIndex + 1 < currentRotatingData->Array.length ? prevIndex + 1 : 0,
  //       )
  //     }, ~interval=Constants.findingRidesDataInterval) // 5 seconds

  //     let timeoutId = Js.Global.setTimeout(() => {
  //       setIsActive(_ => false)
  //       BackGroundTask.stopBackgroundInterval(~bgId=intervalId)
  //     }, fixedDurationInSecond.contents * 1000)

  //     Some(
  //       () => {
  //         Js.Global.clearTimeout(timeoutId)
  //         BackGroundTask.stopBackgroundInterval(~bgId=intervalId)
  //       },
  //     )
  //   } else {
  //     None
  //   }
  // }, [isActive])

  let (modalState, setModalState, closeModal) = React.useContext(
    BottomSheetModalContext.modalContext,
  )
  let (rideSearchContext, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let opacity = Reanimated.useSharedValue(0.0)
  let animatedStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~opacity=Reanimated.withTiming(~toValue=opacity.value, ~userOption={duration: 700.}),
      (),
    )
  })
  let estimateCancelAPI = (id, shouldUpdateStage) =>
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.estimateCancel(id),
      ~onSuccess={
        _ => {
          clearTimer(timerId.current)
          if shouldUpdateStage {
            rideFlowAction(UpdateStage(Search(1)))
          }
        }
      },
      ~onError={
        err => {
          Console.log2("error in api call", err)
        }
      },
    )->ignore

  let dismissPopup = {
    _ => {
      switch estimateId {
      | Some(id) => estimateCancelAPI(id, true)
      | None => ()
      }
      closeModal()
      FindingRidesHelper.clearPollingTime()->ignore
    }
  }
  let changeRideType = {
    _ => {
      switch estimateId {
      | Some(id) => estimateCancelAPI(id, false)
      | None => ()
      }

      let currentTime = getDayJs()
      let searchExpiryTime = getDayJsForString(rideSearchContext.validTill)
      let diff = searchExpiryTime.diff(currentTime, "s")
      if diff > 0 {
        closeModal()
        rideFlowAction(UpdateStage(ChooseYourRide))
      } else {
        closeModal()
        setRideSearchData({...rideSearchContext, validTill: ""})
        rideFlowAction(UpdateStage(ChooseYourRide))
      }
      FindingRidesHelper.clearPollingTime()->ignore
    }
  }

  let cancelRideSearchPopUp = {
    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: {CHANGE_RIDE_TYPE},
        onClose: None,
        primaryText: {CHANGE_RIDE_TYPE_FOR_BETTER_RIDES},
        button1: Some({
          text: {CANCEL_ANYWAY},
          onPress: dismissPopup,
        }),
        button2: Some({
          text: {CHANGE_RIDE_TYPE},
          onPress: changeRideType,
        }),
      })
    />
  }

  let onPress = {
    _ => {
      setModalState({
        ...modalState,
        modalComponent: Some(cancelRideSearchPopUp),
        backgroundClick: () => closeModal(),
      })
    }
  }
  let rotatingData = [
    {
      ...RotatingText.defaultRotatingData,
      text: {GetLocale.getLocale(BRIDGE_IS_BUILT_FOR_THE_CITY_BY_THE_PEOPLE).text},
      prefixImage: Some(AppSmallLogo.svg),
    },
  ]
  BackPress.hardwareBackPress(Minimize)
  React.useEffect(() => {
    opacity.value = 1.0
    Some(
      () => {
        opacity.value = 1.0
      },
    )
  }, [])
  <View
    style={Style.viewStyle(
      ~width=100.->pct,
      ~borderTopLeftRadius=20.,
      ~borderTopRightRadius=20.,
      ~backgroundColor="#ffffff",
      ~alignItems=#center,
      (),
    )}>
    <Space height=80. />
    <Reanimated.ReanimatedView
      style={array([
        viewStyle(
          ~position=#absolute,
          ~top=-49.5->dp,
          ~alignItems=#center,
          ~justifyContent=#center,
          (),
        ),
        animatedStyle,
      ])}>
      <CircularProgress.Previewer radius=55. percent>
        <Lottie
          source={Lottie.Source.fromRequired(
            Packager.require("../../../resources/assets/lottie/ride-booking.json"),
          )}
          autoPlay=true
          loop=true
          style={tw(`h-[65px] w-[110px]`)}
          resizeMode=#contain
        />
      </CircularProgress.Previewer>
    </Reanimated.ReanimatedView>
    <Reanimated.ReanimatedView style={animatedStyle}>
      <TextWrapper
        text={CUSTOM_TEXT({text: currentText})}
        color={ThemebasedStyle.colorClass.textBlack}
        textType={Body_800}
        numberOfLines={1}
        marginBottom={0.->dp}
        marginTop={0.->dp}
        marginLeft={0.->dp}
        marginRight={0.->dp}
      />
    </Reanimated.ReanimatedView>
    <View>
      <Space height=20. />
      <View
        style={viewStyle(
          ~alignItems=#center,
          ~justifyContent=#center,
          ~borderRadius=10.,
          ~padding=10.->dp,
          ~flexDirection=#row,
          (),
        )}>
        <RotatingText
          textList={rotatingData}
          width={Dimensions.get(#screen).width -. 32.}
          height=40.
          paddingVertical={0.->dp}
        />
      </View>
    </View>
    <Space height=20. />
    <View style={viewStyle(~width=100.->pct, ~backgroundColor="#E5E7EB", ~height=2.->dp, ())} />
    <Space height=14. />
    <TouchableOpacity onPress style={viewStyle(~marginBottom=12.->dp, ())}>
      <SafeAreaView>
        <TextWrapper
          text={CANCEL_SEARCH} color=ThemebasedStyle.colorClass.textHigh textType=Body_600
        />
      </SafeAreaView>
      <Space height=20. />
    </TouchableOpacity>
  </View>
}
