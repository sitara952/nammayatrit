open ReactNative
open Style
open Constants
open ReactNavigation
open DayJs
open Tailwind

@react.component
let make = (~navigation, ~currentSnapPoint) => {
  let (rideSearchContext, _) = React.useContext(RideSearchContext.rideSearchContext)
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let (_, _, closeModal) = React.useContext(BottomSheetModalContext.modalContext)
  let _ = UseMapRoute.useMapRoute(currentSnapPoint, None)
  let (estimateId, _) = React.useState(() =>
    switch rideSearchContext.estimateId {
    | Loaded(id) => Some(id)
    | _ => None
    }
  )
  let timerId = React.useRef(None)
  let durationInSeconds = ref(finding_estimates_polling)
  let fixedDurationInSecond = ref(finding_estimates_polling)
  let intervalInSecs: int = finding_estimates_polling_interval
  let clearTimer = id => {
    switch id {
    | None => ()
    | Some(id) => ()
    }
  }

  let _ = quoteId =>
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.confirmRide(quoteId),
      ~onSuccess={_ => {Console.warn("Ride Confirmed")}},
      ~onError={
        err => {
          Console.log2("error in confirmRide api call", err)
        }
      },
    )->ignore

  let handleAPISuccess = data => {
    let estimateResultsResp = EstimatesResults.itemToObjectMapper(data)
    Console.log2("Estimate Results", estimateResultsResp)
    let mbBookingId = estimateResultsResp.bookingId
    switch mbBookingId {
    | None => () // uncomment when multiple offer booking is handled -- MERCY
    // switch estimateResultsResp.selectedQuotes {
    // | None => ()
    // | Some(quotes) =>
    //   Console.log2("Selected Quotes", quotes.selectedQuotes)
    //   switch quotes.selectedQuotes->Array.get(0) {
    //   // get the selectedQuote
    //   | None => ()
    //   | Some(quote) => confirmRideAPI(quote.id)
    //   }
    // }
    | Some(bookingId) => {
        closeModal()
        clearTimer(timerId.current)
        rideFlowAction(UpdateRideDetail(None))
        rideFlowAction(UpdateStage(ConfirmingRide(bookingId)))
        Core.Navigation.navigateWithParams(
          navigation,
          AppRoutes.navigationRouts.bookARideNavigation,
          {
            "screen": AppRoutes.navigationRouts.rideTrackScreen,
          },
        )
      }
    }
  }

  let opacity = Reanimated.useSharedValue(0.)
  let estimatesResultsAPI = estimateId =>
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.estimateResults(estimateId),
      ~onSuccess=handleAPISuccess,
      ~onError={
        err => {
          Console.log2("error in api call", err)
        }
      },
    )->ignore

  let (currentPercent, setCurrentPercent) = React.useState(() => 0.0)

  let (driverNotFound, setdriverNotFound) = React.useState(() => false)
  let percentChanging =
    100.0 /. (float_of_int(durationInSeconds.contents) /. float_of_int(intervalInSecs))
  let animatedStyle = Reanimated.useAnimatedStyle(() => {
    let extrapolateValue = Some(Reanimated.ExtrapolationType.asString("clamp"))
    let interpolate = Reanimated.interpolate(opacity.value, [0., 1.], [200., 0.], extrapolateValue)
    viewStyle(
      ~transform=[
        ReactNative.Style.translateY(
          ~translateY=Reanimated.withTiming(~toValue=interpolate, ~userOption={duration: 300.}),
        ),
      ],
      (),
    )
  })
  let (counter, setCounter) = React.useState(() => 0)
  let (isActive, setIsActive) = React.useState(() => true)

  let fetchAndCalculateDuration = async (currentTime: string) => {
    let startedAt = await EncryptedStorage.getItem(KeyStore.FINDING_RIDE_CREATED_TIME)

    switch startedAt {
    | Some(startedAtStr) => {
        let startedAtTime = dayJsCustomFormat(startedAtStr, "HH:mm:ssA")
        let currentTimeObj = dayJsCustomFormat(currentTime, "HH:mm:ssA")
        let timeDifference = currentTimeObj.diff(startedAtTime, "s")
        setCounter(_ => timeDifference)
        durationInSeconds := fixedDurationInSecond.contents - timeDifference
        if durationInSeconds.contents >= 0 {
          setCurrentPercent(_ => {
            (timeDifference / intervalInSecs)->Int.toFloat *. percentChanging
          })
        } else {
          setCurrentPercent(_ => 0.)
          setdriverNotFound(_ => true)
          setIsActive(_ => false)
          setCounter(_ => 0)
          FindingRidesHelper.clearPollingTime()->ignore
        }
      }
    | None => {
        let currentTime = getDayJs().format("HH:mm:ssA")
        await EncryptedStorage.setItem(KeyStore.FINDING_RIDE_CREATED_TIME, currentTime)
      }
    }
  }

  let tick = estimateId => {
    durationInSeconds := durationInSeconds.contents - intervalInSecs
    setCurrentPercent(prevPercent => {
      let newPercent = prevPercent +. percentChanging
      switch Float.fromString(Float.toString(newPercent)) {
      | None => prevPercent // In case conversion fails, return previous percent
      | Some(floatValue) => floatValue
      }
    })
    if durationInSeconds.contents >= 0 {
      setdriverNotFound(_ => false)
      estimatesResultsAPI(estimateId)
    } else {
      clearTimer(timerId.current)
      setdriverNotFound(_ => true)
      setCurrentPercent(_ => 0.)
      setCounter(_ => 0)
      setIsActive(_ => false)
      FindingRidesHelper.clearPollingTime()->ignore
    }
  }
  let checkAgain = () => {
    let currentTimeFormatted = getDayJs().format("HH:mm:ssA")
    fetchAndCalculateDuration(currentTimeFormatted)->ignore
  }

  // React.useEffect1(() => {
  //   switch estimateId {
  //   | Some(id) => {
  //       timerId.current = Some(
  //         // BackGroundTask.runBackgroundInterval(
  //         //   ~task=() => tick(id),
  //         //   ~interval=intervalInSecs * 1000,
  //         // ),
  //       )
  //       Some(_ => clearTimer(timerId.current))
  //     }
  //   | _ => None
  //   }
  // }, [rideSearchContext])

  <Reanimated.ReanimatedView
    style={array([tw("flex-1  w-full items-center justify-center bg-transparent ")])}>
    <View style={tw(" w-full items-center justify-center absolute bg-white bottom-0 ")}>
      {driverNotFound
        ? <NoDriverAvailable />
        : <FindingRidesFooter
            navigation
            estimateId
            timerId
            clearTimer
            percent={currentPercent}
            fixedDurationInSecond
            counter
            setCounter
            isActive
            setIsActive
          />}
      <View
        style={viewStyle(
          ~top=-120.->dp,
          ~position=#absolute,
          ~width=150.->dp,
          ~height=150.->dp,
          ~borderRadius=100.,
          ~zIndex=1,
          (),
        )}
      />
    </View>
  </Reanimated.ReanimatedView>
}
