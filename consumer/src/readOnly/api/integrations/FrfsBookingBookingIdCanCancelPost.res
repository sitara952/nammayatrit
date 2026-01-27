open APISuccess
open Utils

let frfsBookingBookingIdCanCancelPostApiCall = async (bookingId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/frfs/booking" ++ "/" ++ bookingId ++ "/" ++ "canCancel",
  )
  APISuccess.decodeAPISuccess(data)
}
