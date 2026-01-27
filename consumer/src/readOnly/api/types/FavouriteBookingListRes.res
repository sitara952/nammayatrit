open FavouriteBookingAPIEntity
open Utils

@genType
type favouriteBookingListRes = {list: array<favouriteBookingAPIEntity>}

let decodeFavouriteBookingListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="list is not of array")
          ->Array.map(x =>
            decodeFavouriteBookingAPIEntity(x)->Utils.getResultExn(
              ~message="list is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FavouriteBookingListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: favouriteBookingListRes) => {
  req->asJson
}
