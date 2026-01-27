open ReactNavigation
open ReactNative
open Style
open Reanimated
open ApiRoutes
open Utils
open Tailwind

let containerWidth = Dimensions.get(#screen).width -. 48.
let screenHeight = Dimensions.get(#screen).height

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let parameters: DriverFeedbackType.driverFeedbackParams = switch rideFlowState.rideDetail {
  | Some(rideDetail) => {
      tripDuration: switch (rideDetail.rideEndTime, rideDetail.rideStartTime) {
      | (Some(endTime), Some(startTime)) => calculateUTCDifference(endTime, startTime)
      | (_, _) => 0
      },
      dropLocation: rideDetail.destinationLocationInfo.address,
      tripFare: rideDetail.computedPrice->Option.getOr(0),
      rideId: rideDetail.rideId,
      driverProfileUrl: "../../../../resources/assets/png/driver-image-cover.png",
      currency: rideDetail.currency,
      driverName: rideDetail.driverDetail.firstName,
    }
  | None => {
      tripDuration: 10,
      dropLocation: "Hyatt Regency, New York, USA",
      tripFare: 10,
      driverProfileUrl: "../../../../resources/assets/png/driver-image-cover.png",
      rideId: "",
      currency: "$",
      driverName: "Dean Ambrose",
    }
  }

  let onDriverRating = isPositiveRating => {
    let feedbackReq: FeedBackRateRide.feedbackReq = {
      rating: isPositiveRating ? 5 : 0,
      rideId: parameters.rideId,
      feedbackDetails: None,
      wasOfferedAssistance: None,
    }
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.ridefeedback,
      ~body=FeedBackRateRide.toJSON(feedbackReq),
      ~onSuccess={_ => ()},
      ~onError={err => Console.log3("FeedbackAPI Err", feedbackReq, err)},
    )->ignore
  }

  // ** These are states to be managed for the flow, which is used to render the bottomsheet content
  let (happyRideFlow, setHappyRideFlow) = React.useState(_ => 0.)
  let (unHappyRideFlow, setUnHappyRideFlow) = React.useState(_ => 0.)

  let happyRideFlowSheetRef = React.useRef(Nullable.null)

  let animatedPosition = useSharedValue(0.)

  let openSheet = () => {
    happyRideFlowSheetRef.current
    ->Nullable.toOption
    ->Option.forEach((val: GorhomBottomSheet.element) => {
      val.expand()
    })
  }

  let memoizedSnapPoints = React.useMemo(() => {
    happyRideFlow == 1.
      ? [Float.toString(Utils.dpToPercentageHeight(420.))]
      : unHappyRideFlow == 1.
      ? [Float.toString(Utils.dpToPercentageHeight(570.))]
      : ["100%"]
  }, [happyRideFlow, unHappyRideFlow])

  // ! Problem when using runOnJS and passing a param, which will enable to open the sheet
  // TODO: On fixing the sheet will open and the respective tip sheet component or feedback component will be mounted
  // useAnimatedReaction(
  //   ~prepare=() => animatedPosition.value,
  //   ~react=(_prev, next) => {
  //     switch next {
  //     | Some(next) =>
  //       if Math.ceil(next) === 614.0 {
  //         runOnJS(setHappyRideFlow)(1.)
  //         runOnJS(openSheet)()
  //       }
  //       if Math.ceil(next) === -614.0 {
  //         runOnJS(setUnHappyRideFlow)(1.)
  //         runOnJS(openSheet)()
  //       }
  //     | None => ()
  //     }
  //   },
  //   (),
  // )

  let handleSwipeRight = () => {
    setHappyRideFlow(_ => 1.)
    onDriverRating(true)
    openSheet()
  }
  let handleSwipeLeft = () => {
    setUnHappyRideFlow(_ => 1.)
    onDriverRating(false)
    openSheet()
  }

  let animatedBackgroundStyle = useAnimatedStyle(() => {
    viewStyle(
      ~backgroundColor=interpolateColor(
        animatedPosition.value,
        [-100.0, 0.0, 100.0],
        ["#161622", "#963AFF", "#8519FC"],
        None,
      ),
      (),
    )
  })

  let animatedContainerStyle = useAnimatedStyle(() => {
    viewStyle(
      ~opacity=interpolate(animatedPosition.value, [-100., 0., 100.], [0., 1., 0.], None),
      (),
    )
  })
  <ReanimatedView style={array([tw("flex-1"), animatedBackgroundStyle])}>
    <StatusBar barStyle={#"light-content"} />
    {happyRideFlow == 0. && unHappyRideFlow == 0.
      ? <>
          <ReanimatedView style={tw("flex-1 justify-center items-center")}>
            // TODO: Add Enter and Exit Animations to the following ReanimatedView
            <ReanimatedView>
              <ReanimatedView
                style={array([tw("justify-center items-center"), animatedContainerStyle])}>
                <ReanimatedView
                  style={tw("bg-white w-[52px] h-11 justify-center items-center rounded-[22px]")}>
                  <IconWrapper icon={() => <TickIcon />} size="h-6" />
                </ReanimatedView>
                <ReanimatedView style={array([tw("pt-3 px-15")])}>
                  {
                    let (duration, durationUnit) = fetchTime(parameters.tripDuration)
                    <TextWrapper
                      overRideStyle={array([tw("text-center text-white")])}
                      text={CUSTOM_TEXT({
                        text: GetLocale.getLocale(YAY_REACHED_DESTINATION_IN_JUST).text ++
                        duration ++
                        " " ++
                        durationUnit,
                      })}
                      textType={Head_800}
                    />
                  }
                  <ReanimatedView
                    style={array([tw("flex flex-row justify-center items-center pt-3")])}>
                    <IconWrapper icon={() => <DropLoactionPinIcon fill="white" />} size="h-4" />
                    <TextWrapper
                      text=CUSTOM_TEXT({text: parameters.dropLocation})
                      overRideStyle={tw("text-white pl-0.5")}
                      textType={SBody_700}
                      truncate={Ellipsize(#tail)}
                    />
                    <TextWrapper
                      text=CUSTOM_TEXT({
                        text: " • " ++ parameters.currency ++ parameters.tripFare->Int.toString,
                      })
                      overRideStyle={tw("text-white pl-0.5")}
                      textType={SBody_700}
                    />
                  </ReanimatedView>
                </ReanimatedView>
              </ReanimatedView>
            </ReanimatedView>
            <SwipeToRateCard
              animatedPosition={animatedPosition}
              onRightSwipe={() => handleSwipeRight()}
              onLeftSwipe={() => handleSwipeLeft()}>
              <SwipeCardContent animatedPosition={animatedPosition} parameters />
            </SwipeToRateCard>
            // TODO: Add Enter and Exit Animations to the following ReanimatedView
            <ReanimatedView>
              <ReanimatedView
                style={array([
                  tw("flex flex-row justify-between pt-6"),
                  tw(`w-[${Float.toString(containerWidth)}px]`),
                  animatedContainerStyle,
                ])}>
                <ReanimatedView style={tw("flex flex-row items-center")}>
                  <TranslateXLoop style={tw("flex flex-row items-center")}>
                    // TODO: Change the following View into AnimatingTranslateX Component (Micro Animation)
                    <IconWrapper size="h-[18px]" icon={() => <ArrowLeft fill="#F8F8FB" />} />
                    <IconWrapper size="h-[18px]" icon={() => <ArrowLeft fill="#F8F8FB" />} />
                  </TranslateXLoop>
                  <TextWrapper
                    overRideStyle={array([tw("text-white pl-2")])} text=UNHAPPY textType={SBody_800}
                  />
                </ReanimatedView>
                <ReanimatedView style={tw("flex flex-row items-center")}>
                  <TextWrapper
                    overRideStyle={array([tw("text-white pr-2")])} text=HAPPY textType={SBody_800}
                  />
                  // TODO: Change the following View into AnimatingTranslateX Component (Micro Animation)
                  <TranslateXLoop style={tw("flex flex-row items-center")}>
                    <IconWrapper size="h-[18px]" icon={() => <ArrowRight fill="#F8F8FB" />} />
                    <IconWrapper size="h-[18px]" icon={() => <ArrowRight fill="#F8F8FB" />} />
                  </TranslateXLoop>
                </ReanimatedView>
              </ReanimatedView>
            </ReanimatedView>
          </ReanimatedView>
          <ReanimatedView style={animatedContainerStyle}>
            <SafeAreaView style={tw("mx-6")}>
              <PressableComponent
                style={tw(
                  "border-[1px] border-[#FFFFFF29] h-[52px] justify-center items-center rounded-[12px] mb-3",
                )}>
                <TextWrapper
                  overRideStyle={tw("text-white text-center")} text=REPORT_ISSUE textType={Body_700}
                />
              </PressableComponent>
            </SafeAreaView>
          </ReanimatedView>
        </>
      : React.null}
    {happyRideFlow === 1.
    // TODO: Add Enter/Exit Animation
      ? <ReanimatedView
          style={array([
            tw("absolute w-full justify-center items-center"),
            tw(`h-[${Float.toString(screenHeight -. 420.)}px]`),
          ])}>
          <ReanimatedView style={tw("flex-1 justify-center items-center")}>
            // * * Will be later replaced with a lottie animation
            <Animated.Image
              source={Image.Source.fromRequired(
                Packager.require("../../../resources/assets/png/final-ride.png"),
              )}
              style={tw("h-[33px] w-[86.5px]")}
            />
            <TextWrapper
              textType={Head_700}
              text={THANK_YOU_FOR_RIDING_WITH_BRIDGE}
              overRideStyle={tw("text-white pt-3")}
            />
          </ReanimatedView>
        </ReanimatedView>
      : React.null}
    {unHappyRideFlow === 1.
    // TODO: Add Enter/Exit Animation
      ? <ReanimatedView
          style={array([
            tw("absolute w-full justify-center items-center"),
            tw(`h-[${Float.toString(screenHeight -. 520.)}px]`),
          ])}>
          <ReanimatedView style={tw("flex-1 justify-center items-center")}>
            // * * Will be later replaced with a lottie animation
            <Animated.Image
              source={Image.Source.fromRequired(
                Packager.require("../../../resources/assets/png/unhappy-car.png"),
              )}
              style={tw("h-[54px] w-[86.5px]")}
            />
            <TextWrapper
              textType={Head_700}
              text=SORRY_FOR_UNDESIRED_EXPERIENCE
              overRideStyle={tw("text-white pt-3")}
            />
          </ReanimatedView>
        </ReanimatedView>
      : React.null}
    <GorhomBottomSheet.BottomSheet
      // ! There will be a topInset prop in Bottomsheet, which is required and should be set to top value
      // ! let {top} = useSafeAreaInsets()
      // ! so that the sheet does not go behind the Status Bar
      animateOnMount=true
      ref={Ref.value(happyRideFlowSheetRef)}
      index={-1.}
      handleComponent={() => React.null}
      snapPoints={memoizedSnapPoints}>
      {happyRideFlow == 1.
        ? <TipSheetComponent
            params={parameters} bottomSheetRef={happyRideFlowSheetRef.current->Nullable.getExn}
          />
        : React.null}
      {unHappyRideFlow == 1.
        ? <FeedbackSheetComponent bottomSheetRef={happyRideFlowSheetRef.current->Nullable.getExn} />
        : React.null}
    </GorhomBottomSheet.BottomSheet>
  </ReanimatedView>
}
