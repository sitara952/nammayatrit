open Utils

@genType
type favouriteDriverResp = {
  driverName: string,
  driverPhone: string,
  driverRating: float,
  favCount: int,
  id: string,
}

let decodeFavouriteDriverResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          driverName: getOptionString(dict, "driverName")->Option.getExn(
            ~message="driverName not found",
          ),
          driverPhone: getOptionString(dict, "driverPhone")->Option.getExn(
            ~message="driverPhone not found",
          ),
          driverRating: getOptionFloat(dict, "driverRating")->Option.getExn(
            ~message="driverRating not found",
          ),
          favCount: getOptionInt(dict, "favCount")->Option.getExn(~message="favCount not found"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FavouriteDriverResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: favouriteDriverResp) => {
  req->asJson
}
