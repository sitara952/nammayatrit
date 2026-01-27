open RideTrackScreenType

let getActiveOrPrevRideDetail = () => {
  let (activeRide, setActiveRide) = React.useState(_ => None)
  // let (isEnable, setEnable) = React.useState(_ => false)  for react query
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let apiCall = async (~forPrevRide: bool, ~noOfRides=1) => {
    let forPrevRideString = forPrevRide ? "true" : "false"
    await ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.rideBookingList(
        noOfRides->Int.toString,
        "0",
        forPrevRideString,
        None,
        None,
      ),
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let bookingList = RideBookingList.itemToObjectMapper(obj)
            let transformedRideList = transformRideBookingList(bookingList)
            rideFlowAction(UpdateRideDetail(transformedRideList))
            setActiveRide(_ => transformedRideList)
          }
        | None => setActiveRide(_ => None)
        }
      },
      ~onError=_ => {
        Console.warn("API ERROR")
        setActiveRide(_ => None)
      },
    )
  }
  (activeRide, apiCall)
}

let getRideDetail = () => {
  let (rideDetail, setRideDetail) = React.useState(_ => None)
  let apiCall = (bookingId: string) =>
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.rideBooking(bookingId),
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let rideDetail = RideBooking.itemToObjectMapper(obj)
            Console.log2("rideDetail", rideDetail)
            let transformedRideDetail = transformRideBooking(rideDetail)
            setRideDetail(_ => transformedRideDetail)
          }
        | None => setRideDetail(_ => None)
        }
      },
      ~onError=_ => {
        Console.warn("API ERROR")
        setRideDetail(_ => None)
      },
    )->ignore
  (rideDetail, apiCall)
}
