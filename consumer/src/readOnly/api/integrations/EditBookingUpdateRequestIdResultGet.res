open EditLocationResultAPIResp
open Utils

let editBookingUpdateRequestIdResultGetApiCall = async (bookingUpdateRequestId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/edit" ++ "/" ++ bookingUpdateRequestId ++ "/" ++ "result",
  )
  EditLocationResultAPIResp.decodeEditLocationResultAPIResp(data)
}
