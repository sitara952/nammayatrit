open APISuccess
open Utils

let frfsBookingBookingIdCancelPostApiCall = async (bookingId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/frfs/booking" ++ "/" ++ bookingId ++ "/" ++ "cancel")
  APISuccess.decodeAPISuccess(data)
}
