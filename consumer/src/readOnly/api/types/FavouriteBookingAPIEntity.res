open Location
open Utils

@genType
type favouriteBookingAPIEntity = {
  fromLocation: location,
  id: string,
  rideRating: option<int>,
  startTime: option<string>,
  toLocation: option<location>,
  totalFare: option<int>,
}

let decodeFavouriteBookingAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          rideRating: getOptionInt(dict, "rideRating"),
          startTime: getOptionString(dict, "startTime"),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocation(x)->Result.mapOr(None, x => Some(x))),
          totalFare: getOptionInt(dict, "totalFare"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FavouriteBookingAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: favouriteBookingAPIEntity) => {
  req->asJson
}
