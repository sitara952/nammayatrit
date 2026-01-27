open APISuccess
open Utils

let favoritesDriverIdRemovePostApiCall = async (driverId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/favorites" ++ "/" ++ driverId ++ "/" ++ "remove")
  APISuccess.decodeAPISuccess(data)
}
