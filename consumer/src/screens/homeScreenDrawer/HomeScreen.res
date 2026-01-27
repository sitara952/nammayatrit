open ReactNavigation
open ReactNative
open Style
open Tailwind
external asJson: _ => JSON.t = "%identity"
open PermissionsAndroid
open AppPermissions
type bottomSheetConfig = {
  snapPoints: array<string>,
  handleBackgroundColor: string,
  initialIndex: float,
  enableSheetHeader: bool,
  handleColor: string,
}

module GoToCurrentLocation = {
  @react.component
  let make = (
    ~rideFlowState: RideFlowContext.rideFlowType,
    ~refBottom: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
  ) => {
    <TouchableTextWithIcon
      onPress={_ => {
        refBottom.current
        ->Nullable.toOption
        ->Option.forEach((val: GorhomBottomSheet.element) => {
          val.snapToIndex(0.)
        })
        let (lat, lon) = switch rideFlowState.currentLocation {
        | Some(loc) =>
          switch (loc.lat, loc.lng) {
          | (Some(lat), Some(lon)) => (lat, lon)
          | (_, _) => (Constants.initialCoordinate.latitude, Constants.initialCoordinate.longitude)
          }
        | None => (Constants.initialCoordinate.latitude, Constants.initialCoordinate.longitude)
        }
      }}
      iconSize="30"
      icon=Some(CurrentLocation.svg)
      overRideStyle={
        "viewStyle": tw(
          "h-40px w-40px mb-10px rounded-full bg-white mr-10px justify-center items-center absolute bottom-2px right-0px",
        ),
      }
    />
  }
}
@module("react-native")
external getPermissions: {"PERMISSIONS": {"ACCESS_BACKGROUND_LOCATION": string}} =
  "PermissionsAndroid"

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let isFocused = Native.useIsFocused()
  let sheetIndex0 = Float.toString(
    Utils.dpToPercentageHeight(305. -. (Platform.os == #ios ? 20. : 0.)),
  )
  let sheetIndex1 = Float.toString(
    Utils.dpToPercentageHeight({
      switch rideFlowState.recentSearches {
      | Some(arr) => Array.length(arr) == 1 ? 440. : 505.
      | None => 395.
      } -. (Platform.os == #ios ? 35. : 0.)
    }),
  )
  let (bottomSheetHeight, setBottomSheetHeight) = React.useState(() => {
    Utils.dpToPercentageHeight(330.)
  })
  let (footerHeight, setFooterHeight) = React.useState(_ => 133.)

  let serviceable = UseCurrentLocation.useCurrentLocation()
  let (rideSearchContext, _) = React.useContext(RideSearchContext.rideSearchContext)
  let (askLocationPermission, setAskLocationPermission) = React.useState(_ => true)
  let getTitle = (optTitle: option<string>, optSubtitle: option<string>) => {
    switch (optTitle, optSubtitle) {
    | (Some(title), Some(subtitle)) => {
        let titleLength = title->String.length
        titleLength < 15 ? title ++ ", " ++ subtitle : title
      }
    | (_, _) => ""
    }
  }

  let makeBottomSheetStateConfig = (
    ~snapPoints,
    ~handleBackgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
    ~initialIndex=0.,
    ~enableSheetHeader=false,
    ~handleColor=ThemebasedStyle.colorString.fillNeutralMid,
  ) => {
    snapPoints,
    handleBackgroundColor,
    initialIndex,
    enableSheetHeader,
    handleColor,
  }
  let sourceTitle = switch rideSearchContext.source {
  | Some(source) => getTitle(source.title, source.subtitle)
  | _ => ""
  }
  let permValue = React.useContext(PermissionsContext.permissionContext)

  let checkAccessBackgroundLocationPermission = () => {
    let accessBackgroundLocation: Permission.t = Permission.accessCoarseLocation
    PermissionsAndroid.check(accessBackgroundLocation)
  }
  let checkAccessBackgroundLocationPermissionIOS = () => {
    let iosPerm: AppPermissions.permission = Ios.location_when_in_use
    AppPermissions.check(iosPerm)
  }
  React.useEffect0(() => {
    if Platform.os == #android {
      ignore(
        checkAccessBackgroundLocationPermission()->Promise.then(granted => {
          setAskLocationPermission(_ => granted)
          permValue.locationPermSetter(granted)
          Promise.resolve()
        }),
      )
    } else {
      ignore(
        checkAccessBackgroundLocationPermissionIOS()->Promise.then(grantedVal => {
          if grantedVal == granted {
            setAskLocationPermission(_ => true)
            permValue.locationPermSetter(true)
          } else {
            setAskLocationPermission(_ => false)
          }

          Promise.resolve()
        }),
      )
    }
    None
  })

  let destinationTitle = switch rideSearchContext.destination {
  | Some(destination) => getTitle(destination.title, destination.subtitle)
  | _ => ""
  }

  let (currentInitialIndex, setInitialIndex) = React.useState(_ => 0.)

  let memoizedBottomsheetState = React.useMemo(() => {
    switch rideFlowState.stage {
    | RideFlowContext.Search(_) =>
      makeBottomSheetStateConfig(~snapPoints=Constants.searchScreenSnapPoints)
    | RideFlowContext.ConfirmPickup =>
      makeBottomSheetStateConfig(
        ~snapPoints=Constants.confirmPickupSnapPoints,
        ~handleBackgroundColor=ThemebasedStyle.colorString.fillPrimaryMid,
      )
    | RideFlowContext.ConfirmSpecialPickup =>
      makeBottomSheetStateConfig(
        ~snapPoints=Constants.confirmSpecialPickupSnapPoints,
        ~handleBackgroundColor=ThemebasedStyle.colorString.fillPrimaryMid,
      )
    | RideFlowContext.FindingRides =>
      makeBottomSheetStateConfig(~snapPoints=Constants.findingRidesSnapPoints)
    | RideFlowContext.WaitingForDriverOffer(_) =>
      makeBottomSheetStateConfig(~snapPoints=Constants.findingRidesSnapPoints)
    | _ =>
      makeBottomSheetStateConfig(
        ~snapPoints=[sheetIndex0, "71%", "80%", "90%"],
        ~enableSheetHeader=true,
      )
    }
  }, [rideFlowState.stage])

  let shouldRenderBackIcon = React.useMemo(() => {
    switch rideFlowState.stage {
    | ConfirmPickup | ConfirmSpecialPickup | ChooseYourRide => true
    | _ => false
    }
  }, [rideFlowState.stage])

  let shouldRenderBottomSheetHeader = React.useMemo(() => {
    switch rideFlowState.stage {
    | FindingRides => false
    | _ => true
    }
  }, [rideFlowState.stage])

  let headerComponent = {
    switch rideFlowState.stage {
    | ChooseYourRide =>
      <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp}>
        {Array.length(rideSearchContext.estimateList) == 0
          ? React.null
          : <FromTo source=sourceTitle destination=destinationTitle />}
      </ScreenWrapperWithSafeArearViewAndPadding>
    | _ => React.null
    }
  }

  let homeBottomSheetRef = React.useRef(Nullable.null)

  let footerComponent = {
    switch rideFlowState.stage {
    | ChooseYourRide => <PaymentSwipeableButton navigation footerHeight setFooterHeight />
    | _ => React.null
    }
  }
  let snapPoints = {
    if !askLocationPermission {
      ["45%", "55%", "75%", "85%"]
    } else {
      switch rideFlowState.stage {
      | ChooseYourRide => [bottomSheetHeight->Float.toString]
      | HomeScreen =>
        switch serviceable {
        | Some(true) => [sheetIndex0, sheetIndex1, "71%", "80%", "90%"]
        | Some(false) | None => Constants.locUnserviceableSnapPoints
        }
      | _ => memoizedBottomsheetState.snapPoints
      }
    }
  }

  React.useEffect(() => {
    Console.log2("loc debug", serviceable)
    None
  }, [serviceable])

  React.useEffect2(() => {
    if isFocused {
      switch rideFlowState.stage {
      | HomeScreen =>
        switch serviceable {
        | Some(true) => setTimeout(() => setInitialIndex(_ => 1.), 0)->ignore
        | Some(false) | None => setInitialIndex(_ => 0.)
        }
      | _ => setInitialIndex(_ => 0.)
      }
    } else {
      setInitialIndex(_ => 0.)
    }
    None
  }, ([rideFlowState.stage], [isFocused]))

  let shouldRenderSheetHandle =
    rideFlowState.stage == HomeScreen
      ? switch serviceable {
        | Some(serviceable) => serviceable
        | None => false
        }
      : memoizedBottomsheetState.enableSheetHeader
  let (isReferralApplied, setIsReferralApplied) = React.useState(_ => None)
  let toastcontext = React.useContext(ToastContext.context)
  let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)
  let handleOnpress = {
    _ => {
      setModal({
        ...modal,
        modalComponent: Some(<ReferralPopUp closeModal setIsReferralApplied />),
        backgroundClick: () => closeModal(),
      })
    }
  }

  React.useEffect1(() => {
    if isReferralApplied != None && isReferralApplied == Some("Success") {
      closeModal()
      toastcontext.updateProperties(~extraInsets={top: 0, bottom: 310, right: 10, left: 0})
      ToastWrapper.myToast(
        ~message={CUSTOM_TEXT({text: "Referral Applied Successfully"})},
        ~duration=3000,
        ~position=Toast.toInt(BOTTOM),
        ~animationConfig={
          flingPositionReturnDuration: 10,
          animationStiffness: 100,
          animationDuration: 1000,
        },
      )
    }
    setIsReferralApplied(_ => None)
    None
  }, [isReferralApplied])

  {
    <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp}>
      <ScreenWrapperWithSafeArearViewAndPadding>
        {shouldRenderBackIcon
          ? <BottomSheetBackButton.BottomSheetBackIcon
              chooseRideHeight={Utils.percentageHeightToDp(bottomSheetHeight) +. (
                Platform.os == #ios ? 14. : 0.
              )}
              stage=rideFlowState.stage
              isAndroid={Platform.os == #android}
              estimateLoaded={Array.length(rideSearchContext.estimateList) != 0}
            />
          : shouldRenderBottomSheetHeader
          ? <View style={tw(`pt-2.5`)}>
            <BottomSheetWrapper.Header navigation handleOnpress />
          </View>
          : React.null}
      </ScreenWrapperWithSafeArearViewAndPadding>
      <BottomSheetWrapper
        initialIndex=currentInitialIndex
        sheetRef=homeBottomSheetRef
        snapPoints={snapPoints}
        showBottomSheetHandle={shouldRenderSheetHandle}
        backgroundColor={memoizedBottomsheetState.handleBackgroundColor}
        bottomSheetHandleColor={memoizedBottomsheetState.handleColor}
        header={() => headerComponent}
        footer={footerComponent}
        bottomSheetHeader={switch rideFlowState.stage {
        | HomeScreen =>
          switch serviceable {
          | Some(true) => <GoToCurrentLocation rideFlowState refBottom={homeBottomSheetRef} />
          | Some(false) => React.null
          | None => <View style={tw("h-50px")} />
          }
        | _ => React.null
        }}
        sheetComponent={(
          ~snapToIndex,
          ~handleClosePress as _,
          ~handleExpandPress,
          ~currentSnapPoint,
        ) => {
          !askLocationPermission
            ? <AskLocationPermission setAskLocationPermission />
            : switch rideFlowState.stage {
              | HomeScreen =>
                switch serviceable {
                | Some(true) =>
                  <HomeBottomSheet sheetRef=homeBottomSheetRef setInitialIndex navigation />
                | Some(false) => <LocationUnserviceable snapToIndex />
                | None => <HomeScreenShimmer />
                }
              | Search(activeIndex) =>
                <SearchScreen
                  handleExpandPress activeIndex sheetRef=homeBottomSheetRef navigation
                />
              | ConfirmPickup | ConfirmSpecialPickup => React.null
              | ChooseYourRide =>
                <ChooseYourRideScreen bottomSheetHeight setBottomSheetHeight footerHeight />
              | FindingRides | WaitingForDriverOffer(_) =>
                <FindingRides navigation currentSnapPoint />
              | _ => React.null
              }
        }}>
        {<> </>}
      </BottomSheetWrapper>
    </ScreenWrapperWithSafeArearViewAndPadding>
  }
}
