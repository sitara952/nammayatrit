open SafetyType
open CreateSos
open RideBooking.RideStatus
open ReactNavigation

let safetyHook = (navigation, rideDetail: option<RideTrackScreenType.rideDetail>) => {
  let (safetyStage, setSafetyStage) = React.useState(_ => None)
  let (modalState, setModalState, closeModal) = React.useContext(
    BottomSheetModalContext.modalContext,
  )

  let _ = () => {
    switch rideDetail {
    | Some(rideDetailData: RideTrackScreenType.rideDetail) =>
      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.createSos,
        ~body=makeSosReq(
          makeSosFlow("SafetyFlow", ""),
          rideDetailData.rideId,
          rideDetailData.rideStatus == INPROGRESS,
        )->Utils.asJson,
        ~onSuccess=_ => (),
        ~onError={err => Console.log2("createSos API ERROR", err)},
      )->ignore
    | None => ()
    }
  }

  let closeSafetyModal = () => {
    closeModal()
    setSafetyStage(_ => None)
  }

  let openCallSupportPopUp = () => {
    setModalState({
      ...modalState,
      modalComponent: Some(<CallSupport closeSafetyModal />),
      backgroundClick: () => closeSafetyModal(),
      onClose: () => setSafetyStage(_ => None),
    })
  }

  let openEmergencyAssistancePopUp = () => {
    switch rideDetail {
    | Some(rideDetailData: RideTrackScreenType.rideDetail) =>
      setModalState({
        ...modalState,
        modalComponent: Some(
          <EmergencyAssistance vehicleDetail=rideDetailData.vehicleDetail closeSafetyModal />,
        ),
        backgroundClick: () => closeSafetyModal(),
        onClose: () => setSafetyStage(_ => None),
      })
    | None => ()
    }
  }

  let rec openShareRideInfo = () => {
    Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    setModalState({
      ...modalState,
      modalComponent: Some(<ShareRideInfo navigation closeSafetyModal openShareRideInfo />),
      backgroundClick: () => closeSafetyModal(),
      onClose: () => setSafetyStage(_ => None),
    })
  }

  let openSafetyOptions = () => {
    setModalState({
      ...modalState,
      modalComponent: Some(
        <SafetyOptions
          closeSafetyModal openCallSupportPopUp openEmergencyAssistancePopUp openShareRideInfo
        />,
      ),
      backgroundClick: () => closeSafetyModal(),
      onClose: () => setSafetyStage(_ => None),
    })
  }

  let actions = (stage: option<safetyFlowStage>) =>
    switch stage {
    | Some(stage') =>
      switch stage' {
      | SafetyOptions => openSafetyOptions()
      | CallSupport => openCallSupportPopUp()
      | EmergencyAssistance => openEmergencyAssistancePopUp()
      | ShareRideInfo => openShareRideInfo()
      }
    | None => ()
    }

  React.useEffect(() => {
    actions(safetyStage)
    None
  }, [safetyStage])

  setSafetyStage
}
