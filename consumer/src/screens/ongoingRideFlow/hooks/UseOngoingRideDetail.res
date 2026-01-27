open ReactNative
open ReactNavigation
open ReactNative.Share
open CancelRideStage
open Logger
@genType
type rideDetails = {
  rideId: string,
  sourceLocationInfo: LocationTypes.location,
  destinationLocationInfo: LocationTypes.location,
}
@genType
let getRouteApiCall = (
  srcLat,
  srcLon,
  destLat,
  destLon,
  middleStops,
  setDriverTravelledDist,
  setPickupDistance,
  onRoute: option<RouteAPI.routeApiType> => unit,
) => {
  ApiCall.callPostAPI(
    ~url=ApiRoutes.apiRoutes.getRoute("pickup"),
    ~body=RouteAPI.makeGetRouteReq(srcLat, srcLon, destLat, destLon, middleStops)->RouteAPI.toJson,
    ~onSuccess={
      resp => {
        switch resp->JSON.Decode.array {
        | Some(obj) => {
            let routeResp = RouteAPI.routeItemToObjectMapper(obj)

            let maybeDistanceWithUnit =
              routeResp->Array.get(0)->Belt.Option.map(route => route.distanceWithUnit)
            let (distance, unit) = switch maybeDistanceWithUnit {
            | Some({value, unit}) => (value, unit)
            | None => (0., Meter)
            }
            setDriverTravelledDist(0.0)
            setPickupDistance(distance)
            onRoute(routeResp->Array.get(0))
          }
        | None => ()
        }
      }
    },
    ~onError={
      err => {
        Console.error2("draw route error", err)
      }
    },
  )->ignore
}
@genType
let activeRideDetail = (rideFlowState_Stage: RideFlowContext.stage, bookingId) => {
  switch rideFlowState_Stage {
  | ConfirmingRide(_) | RideAssigned | RideStarted =>
    switch bookingId {
    | Some(bookingId) =>
      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.rideBooking(bookingId),
        ~onSuccess=resp => {
          switch resp->JSON.Decode.object {
          | Some(obj) => {
              let rideDetail = RideBooking.itemToObjectMapper(obj)
              let transformedRideDetail = RideTrackScreenType.transformRideBooking(rideDetail)
              let stage = RideFlowContext.getStageFromRideStatus(transformedRideDetail)
              // switch stage {
              // | HomeScreen => {
              //     rideFlowAction(UpdateStage(HomeScreen))
              //     Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.homeScreen)
              //   }
              // | _ => rideFlowAction(UpdateRideDetail(transformedRideDetail))
              // }
            }
          | None => ()
          }
        },
        ~onError=_ => {
          Console.warn("rideBooking API ERROR")
        },
      )->ignore
    | None => ()
    }
  | _ => ()
  }
}
@genType
let driverLocationApiCall = (
  rideFlowState_Stage: RideFlowContext.stage,
  rideId: string,
  onSuccess: option<DriverLocation.rideIdDriverLocationType> => unit,
) => {
  switch rideFlowState_Stage {
  | RideAssigned | RideStarted =>
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.driverLocation(rideId),
      ~onSuccess={
        resp => {
          switch resp->JSON.Decode.object {
          | Some(res) => {
              let driverLocation = DriverLocation.itemToObjectMapper(res)
              onSuccess(Some(driverLocation))
            }
          | None => ()
          }
        }
      },
      ~onError={
        err => {
          Console.error2("ERROR API get driverLocation", err)
        }
      },
    )->ignore
  | _ => ()
  }
}

let useRideDetail = (
  navigation,
  currentSnapPoint,
  topComponentHeight,
  ~setPickupDistance=?,
  ~setPickpDistanceUnit=?,
  ~setDriverTravelledDist=?,
) => {
  let coordinatesArray: React.ref<array<ReactMap.latLng>> = React.useRef([])
  let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)
  let driverLocationIntervalId: React.ref<option<int>> = React.useRef(None)
  let rideDetailIntervalId: React.ref<option<int>> = React.useRef(None)
  let drawRoute = UseMapRoute.useMapRoute(currentSnapPoint, topComponentHeight)
  let (cancelRideStage, setCancelRideStage) = React.useState(_ => None)
  let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)
  let (isKeyboardOpen, setIsKeyboardOpen) = React.useState(_ => false)
  let getBookingId = (): option<string> => {
    switch rideFlowState.stage {
    | RideAssigned | RideStarted =>
      switch rideFlowState.rideDetail {
      | Some(rideDetail) => Some(rideDetail.bookingId)
      | None => None
      }
    | ConfirmingRide(bookingId) => Some(bookingId)
    | _ => None
    }
  }

  let cleanUpTasks = () => {
    switch rideDetailIntervalId.current {
    | Some(intervalId) => BackGroundTask.stopBackgroundInterval(~bgId=intervalId)
    | None => ()
    }
    switch driverLocationIntervalId.current {
    | Some(intervalId) => BackGroundTask.stopBackgroundInterval(~bgId=intervalId)
    | None => ()
    }
    rideDetailIntervalId.current = None
    driverLocationIntervalId.current = None
    ()
  }

  let cancelSuccessListener = () => {
    closeModal()
    setCancelRideStage(_ => None)
    rideFlowAction(UpdateStage(HomeScreen))
    Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.homeScreen)
  }

  let drawRouteApiCall = (srcLat, srcLon, destLat, destLon) => {
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.getRoute("pickup"),
      ~body=RouteAPI.makeGetRouteReq(srcLat, srcLon, destLat, destLon, [])->RouteAPI.toJson,
      ~onSuccess={
        resp => {
          switch resp->JSON.Decode.array {
          | Some(obj) => {
              let routeResp = RouteAPI.routeItemToObjectMapper(obj)

              let maybeDistanceWithUnit =
                routeResp->Array.get(0)->Belt.Option.map(route => route.distanceWithUnit)
              let (distance, unit) = switch maybeDistanceWithUnit {
              | Some({value, unit}) => (value, unit)
              | None => (0., Meter)
              }
              coordinatesArray.current = []
              Utils.mapWithUnit(setDriverTravelledDist, setFn => setFn(_ => Some(0.0)))
              Utils.mapWithUnit(setPickupDistance, setFn => setFn(_ => Some(distance)))
              Utils.mapWithUnit(setPickpDistanceUnit, setFn => setFn(_ => Some(unit)))

              switch setPickupDistance {
              | Some(setFn) => setFn(_ => Some(distance))
              | None => ()
              }
              switch setPickpDistanceUnit {
              | Some(setFn) => setFn(_ => Some(unit))
              | None => ()
              }
              drawRoute(routeResp->Array.get(0))->ignore
            }
          | None => ()
          }
        }
      },
      ~onError={
        err => {
          Console.error2("draw route error", err)
        }
      },
    )->ignore
  }

  let activeRideDetail = () => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      switch getBookingId() {
      | Some(bookingId) =>
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.rideBooking(bookingId),
          ~onSuccess=resp => {
            switch resp->JSON.Decode.object {
            | Some(obj) => {
                let rideDetail = RideBooking.itemToObjectMapper(obj)
                let transformedRideDetail = RideTrackScreenType.transformRideBooking(rideDetail)
                let stage = RideFlowContext.getStageFromRideStatus(transformedRideDetail)
                switch stage {
                | HomeScreen => {
                    rideFlowAction(UpdateStage(HomeScreen))
                    Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.homeScreen)
                  }
                | _ => rideFlowAction(UpdateRideDetail(transformedRideDetail))
                }
              }
            | None => ()
            }
          },
          ~onError=_ => {
            Console.warn("rideBooking API ERROR")
          },
        )->ignore
      | None => ()
      }
    | _ => ()
    }
  }

  let driverLocationApiCall = () => {
    switch rideFlowState.stage {
    | RideAssigned | RideStarted =>
      switch rideFlowState.rideDetail {
      | Some(rideDetail) =>
        ApiCall.callPostAPI(
          ~url=ApiRoutes.apiRoutes.driverLocation(rideDetail.rideId),
          ~onSuccess={
            resp => {
              switch resp->JSON.Decode.object {
              | Some(res) => {
                  let driverLocation = DriverLocation.itemToObjectMapper(res)
                  let pickUpOrDropLocation =
                    rideFlowState.stage == RideAssigned
                      ? rideDetail.sourceLocationInfo
                      : rideDetail.destinationLocationInfo
                  switch (
                    driverLocation.lat,
                    driverLocation.lon,
                    pickUpOrDropLocation.lat,
                    pickUpOrDropLocation.lon,
                  ) {
                  | (Some(srcLat), Some(srcLon), Some(destLat), Some(destLon)) =>
                    coordinatesArray.current = [
                      ...coordinatesArray.current,
                      {latitude: srcLat, longitude: srcLon},
                    ]
                  | _ => ()
                  }
                }
              | None => ()
              }
            }
          },
          ~onError={
            err => {
              Console.warn2("ERROR API", err)
            }
          },
        )->ignore
      | None => ()
      }
    | _ => ()
    }
  }

  // React.useEffect1(() => {
  //   switch rideFlowState.stage {
  //   | ConfirmingRide(_) | RideAssigned | RideStarted => {
  //       if rideDetailIntervalId.current == None {
  //         activeRideDetail()
  //         rideDetailIntervalId.current = Some(
  //           // BackGroundTask.runBackgroundInterval(~task=activeRideDetail, ~interval=5000),
  //         )
  //         ()
  //       }
  //       if (
  //         driverLocationIntervalId.current == None &&
  //           (rideFlowState.stage == RideAssigned || rideFlowState.stage == RideStarted)
  //       ) {
  //         driverLocationApiCall()
  //         driverLocationIntervalId.current = Some(
  //           // BackGroundTask.runBackgroundInterval(~task=driverLocationApiCall, ~interval=5000),
  //         )
  //         ()
  //       }
  //     }
  //   | _ => cleanUpTasks()
  //   }

  //   Some(cleanUpTasks)
  // }, [rideFlowState.stage])

  // ---- not needed
  React.useEffect2(() => {
    {
      switch rideFlowState.rideDetail {
      | Some(rideDetailData) =>
        switch cancelRideStage {
        | Some(modalState) =>
          setModal({
            ...modal,
            modalComponent: Some(
              switch modalState {
              | CancelConfirmation =>
                <CancelRidePopUp.CancelConfirmation
                  onPressButton1={() => setCancelRideStage(_ => Some(CancellationList))}
                  onPressButton2=closeModal
                />
              | _ =>
                <CancelRidePopUp.CancelReason
                  bookingId=rideDetailData.bookingId
                  setIsKeyboardOpen
                  rideCancelSuccessListener=cancelSuccessListener
                />
              },
            ),
            backgroundClick: () => isKeyboardOpen ? Keyboard.dismiss() : closeModal(),
            onClose: () => setCancelRideStage(_ => None),
          })
        | None => ()
        }
      | None => ()
      }
    }

    None
  }, (cancelRideStage, isKeyboardOpen))

  let shareRide = (rideDetailData: RideTrackScreenType.rideDetail) => {
    let shareContent = async (~message: string, ~url: string) => {
      let content: Share.content = {
        title: "Share Ride",
        message,
        url,
      }
      let options: Share.options = {
        dialogTitle: "Share ride",
        subject: "Sharing ride",
      }
      let shareAction = await Share.shareWithOptions(content, options)
    }
    let rideTrackUrl = "https://bridge.cab/t?i=" ++ rideDetailData.rideId // to be replace with merchant domain
    let message =
      "👋 Hey," ++
      "\n\nI am riding with " ++
      rideDetailData.driverDetail.firstName ++
      "! Track this ride on: " ++
      rideTrackUrl ++
      "\n\nVehicle number: " ++
      rideDetailData.vehicleDetail.vehicleNumber
    let _ = shareContent(~message, ~url=rideTrackUrl)
  }

  (rideFlowState, shareRide, setCancelRideStage)
}
