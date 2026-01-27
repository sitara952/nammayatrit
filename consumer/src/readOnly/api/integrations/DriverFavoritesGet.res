open FavouriteDriverRespArray
open Utils

let driverFavoritesGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/driver/favorites")
  FavouriteDriverRespArray.decodeFavouriteDriverRespArray(data)
}
