open APISuccess
open Utils

let editResultBookingUpdateRequestIdConfirmPostApiCall = async (bookingUpdateRequestId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/edit/result" ++ "/" ++ bookingUpdateRequestId ++ "/" ++ "confirm",
  )
  APISuccess.decodeAPISuccess(data)
}
