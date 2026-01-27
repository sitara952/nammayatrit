open FollowersArray
open Utils

let followRideGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/follow/ride")
  FollowersArray.decodeFollowersArray(data)
}
