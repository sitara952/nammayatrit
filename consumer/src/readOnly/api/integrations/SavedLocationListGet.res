open SavedReqLocationsListRes
open Utils

let savedLocationListGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/savedLocation/list")
  SavedReqLocationsListRes.decodeSavedReqLocationsListRes(data)
}
