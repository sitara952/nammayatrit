open FavouriteDriverResp
open Utils

@genType
type favouriteDriverRespArray = array<favouriteDriverResp>

let decodeFavouriteDriverRespArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFavouriteDriverResp(x)->Utils.getResultExn(
          ~message="error in parsing favouriteDriverResp",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("FavouriteDriverRespArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: favouriteDriverRespArray) => {
  req->asJson
}
