open FRFSCanCancelStatus
open Utils

let frfsBookingBookingIdCanCancelStatusGetApiCall = async (bookingId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/booking" ++ "/" ++ bookingId ++ "/" ++ "canCancel/status",
  )
  FRFSCanCancelStatus.decodeFRFSCanCancelStatus(data)
}
