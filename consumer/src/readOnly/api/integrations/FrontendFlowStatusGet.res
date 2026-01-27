open GetPersonFlowStatusRes
open Utils

let frontendFlowStatusGetApiCall = async (
  isPolling: option<bool>,
  checkForActiveBooking: option<bool>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frontend/flowStatus" ++
    ("?" ++
    Option.mapOr(isPolling, "", x => "&isPolling=" ++ x->boolToString) ++
    Option.mapOr(checkForActiveBooking, "", x => "&checkForActiveBooking=" ++ x->boolToString)),
  )
  GetPersonFlowStatusRes.decodeGetPersonFlowStatusRes(data)
}
