open Enums
open DriverNo
open FavouriteBookingListRes
open Utils

let rideBookingFavouritesListPostApiCall = async (
  limit: option<int>,
  offset: option<int>,
  onlyActive: option<bool>,
  status: option<RideBookingFavouritesListStatus.rideBookingFavouritesListStatus>,
  clientId: option<string>,
  body: driverNo,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideBooking/favourites/list" ++
    ("?" ++
    Option.mapOr(limit, "", x => "&limit=" ++ x->Js.Int.toString) ++
    Option.mapOr(offset, "", x => "&offset=" ++ x->Js.Int.toString) ++
    Option.mapOr(onlyActive, "", x => "&onlyActive=" ++ x->boolToString) ++
    Option.mapOr(status, "", x =>
      "&status=" ++ x->RideBookingFavouritesListStatus.rideBookingFavouritesListStatusToString
    ) ++
    Option.mapOr(clientId, "", x => "&clientId=" ++ x)),
    ~body=body->DriverNo.toJson,
  )
  FavouriteBookingListRes.decodeFavouriteBookingListRes(data)
}
