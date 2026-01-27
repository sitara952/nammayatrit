open ReactNative
open Style
open RideTrackScreenType
open DayJs
open LocaleStringType

@genType
let calculateTimeDifference = time => {
  let driverArrivalTime = getDayJsForString(time)
  let currentTime = getDayJs()
  let timeDifference = currentTime.DayJs.diff(driverArrivalTime, "s")
  timeDifference
}
@genType
let distanceLeft = (estimatedDistance, driverTravelledDist) => {
  switch estimatedDistance {
  | Some(estimatedDist) => estimatedDist -. driverTravelledDist
  | None => estimatedDistance->Option.getOr(0.0)
  }
}

@genType @react.component
let make = (
  ~pickupDistance,
  ~pickpDistanceUnit,
  ~destinationLocationInfo,
  ~driverTravelledDist: option<float>,
) => {
  let (rideFlowState, _rideFlowAction) = React.useContext(RideFlowContext.context)
  let vehicleDetail = switch rideFlowState.rideDetail {
  | Some(rideDetail) => Some(rideDetail.vehicleDetail)
  | None => None
  }

  let rideStatus = switch rideFlowState.rideDetail {
  | Some(rideDetail) => Some(rideDetail.rideStatus)
  | None => None
  }
  let driverArrivalTime = switch rideFlowState.rideDetail {
  | Some(rideDetail) =>
    switch rideDetail.driverArrivalTime {
    | Some(time) if time != "" => Some(time)
    | _ => None
    }
  | None => None
  }

  let estimatedDistance =
    rideFlowState.rideDetail->Option.flatMap(rideDetail => rideDetail.estimatedDistance)

  let (isWaiting, setIsWaiting) = React.useState(() => false)

  let (second, setSecond) = React.useState(() => 0)

  let calculateTimeDifference = time => {
    let driverArrivalTime = getDayJsForString(time)
    let currentTime = getDayJs()
    let timeDifference = currentTime.DayJs.diff(driverArrivalTime, "s")
    setSecond(_ => timeDifference)
  }

  React.useEffect1(() => {
    if isWaiting {
      switch driverArrivalTime {
      | Some(time) => {
          calculateTimeDifference(time)
          let intervalId = Js.Global.setInterval(() => {
            calculateTimeDifference(time)
          }, 1000)
          Some(() => Js.Global.clearInterval(intervalId))
        }
      | None => None
      }
    } else {
      None
    }
  }, [isWaiting])

  React.useEffect1(() => {
    switch driverArrivalTime {
    | Some(_) =>
      setIsWaiting(_ => true)
      None
    | None => None
    }
  }, [driverArrivalTime])
  React.useEffect1(() => {
    switch rideStatus {
    | Some(RideBooking.RideStatus.INPROGRESS) => {
        setIsWaiting(_ => false)
        setSecond(_ => 0)
        None
      }
    | _ => None
    }
  }, [rideStatus])

  // let calculateDistance = (distance, unit) => {
  //   switch unit {
  //   | Some(RouteAPI.Mile) => (Some(distance), Some(RouteAPI.Mile))
  //   | Some(RouteAPI.Meter) =>
  //     if distance < 50.0 {
  //       (Some(distance), Some(RouteAPI.Meter))
  //     } else if distance >= 1000.0 {
  //       let distanceInFloat = Float.toFixed(distance /. 1000.0, ~digits=1)
  //       (
  //         Some(distanceInFloat->Float.fromString->Belt.Option.getWithDefault(0.0)),
  //         Some(RouteAPI.Kilometer),
  //       )
  //     } else {
  //       (Some(distance), Some(RouteAPI.Meter))
  //     }
  //   | Some(_) => (None, Some(RouteAPI.defaultDistanceUnit))
  //   | None => (None, Some(RouteAPI.defaultDistanceUnit))
  //   }
  // }

  let (updatedPickupDist: option<float>, distanceUnit) = switch rideStatus {
  | _ =>
    switch pickupDistance {
    | Some(distance) => (Some(distance), pickpDistanceUnit)
    | None => (None, Some(RouteAPI.defaultDistanceUnit))
    }
  }

  // let driverFirstName = switch rideFlowState.rideDetail {
  // | Some(rideDetailData) => rideDetailData.driverDetail.firstName
  // | None => "Driver"
  // }
  let distanceLeft = (estimatedDistance, driverTravelledDist) => {
    switch estimatedDistance {
    | Some(estimatedDist) => estimatedDist -. driverTravelledDist
    | None => estimatedDistance->Option.getOr(0.0)
    }
  }

  let messageBasedOnArrivalTime = (
    estimatedDistance: option<float>,
    driverTravelledDist: option<float>,
    second: int,
    driverArrivalTime: bool,
    driverFirstName: string,
  ) => {
    let distanceTraveled = switch driverTravelledDist {
    | Some(pickupDist) => pickupDist
    | None => 0.0
    }
    let message = switch (estimatedDistance, rideStatus) {
    | (Some(_), Some(RideBooking.RideStatus.INPROGRESS)) => BRIDGE_TO_DESTINATION
    | (Some(distance), _) if distance >= 0. =>
      if driverArrivalTime {
        if second > 240 {
          CAB_IS_LEAVING_SOON
        } else if second > 150 && second->mod(60) < 30 {
          WAITING_CHARGES_APPLY_NOW
        } else if second > 60 {
          CAB_IS_WAITING_FOR_YOU
        } else {
          CAB_HAS_ARRIVED
        }
      } else if distance -. distanceTraveled < 30.0 {
        CAB_HAS_ARRIVED
      } else if distance -. distanceTraveled <= 3218.69 {
        CAB_IS_ARRIVING
      } else {
        switch driverTravelledDist {
        | Some(pickupDist) if pickupDist != 0.0 && pickupDist > 160.934 =>
          CUSTOM_TEXT({
            text: driverFirstName ++ " " ++ GetLocale.getLocale(IS_ON_THE_WAY).text,
          })
        | _ =>
          CUSTOM_TEXT({
            text: driverFirstName ++ " " ++ GetLocale.getLocale(IS_YOUR_DRIVER).text,
          })
        }
      }
    | _ => BRIDGE_TO_DESTINATION
    }
    message
  }

  let distanceUnitToString = (distanceUnit: option<RouteAPI.distanceUnit>) => {
    switch distanceUnit {
    | Some(unit) =>
      switch unit {
      | Meter => "Meter"
      | Mile => "Mile"
      | Yard => "Yard"
      | Kilometer => "Km"
      }
    | None => ""
    }
  }
  <View
    style={viewStyle(
      ~flexDirection=#row,
      ~backgroundColor="#161622",
      ~borderRadius=36.,
      ~margin=10.->dp,
      ~height=72.->dp,
      ~alignItems=#center,
      (),
    )}>
    <View style={viewStyle(~flexDirection=#row, ~marginLeft=8.->dp, ())}>
      <View
        style={viewStyle(
          ~width=60.->dp,
          ~height=56.->dp,
          ~borderRadius=34.,
          ~backgroundColor="#E0D1FF",
          ~alignItems=#center,
          (),
        )}>
        <RideStatusPillLottie
          updatedPickupDist
          distanceUnit={distanceUnitToString(distanceUnit)}
          rideStatus
          second
          isWaiting
        />
      </View>
    </View>
    <View
      style={viewStyle(
        ~flex=1.,
        ~flexDirection=#column,
        ~justifyContent=#center,
        ~marginLeft=10.->dp,
        (),
      )}>
      <View style={viewStyle(~justifyContent=#"flex-start", ())}>
        // <TextWrapper
        //   text={messageBasedOnArrivalTime(updatedPickupDist, second, isWaiting)}
        //   textType={Head_800}
        //   color=ThemebasedStyle.colorClass.textWhite
        // />
      </View>
      <RideStatusPillContent vehicleDetail rideStatus destinationLocationInfo />
    </View>
  </View>
}
