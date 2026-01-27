open FRFSCancelStatus
open Utils

let frfsBookingCancelBookingIdStatusGetApiCall = async (bookingId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/booking/cancel" ++ "/" ++ bookingId ++ "/" ++ "status",
  )
  FRFSCancelStatus.decodeFRFSCancelStatus(data)
}
