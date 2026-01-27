open RouteInfo
open Utils

@genType
type searchResp = {
  routeInfo: option<routeInfo>,
  searchExpiry: string,
  searchId: string,
}

let decodeSearchResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          routeInfo: dict
          ->Dict.get("routeInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeRouteInfo(x)->Result.mapOr(None, x => Some(x))),
          searchExpiry: getOptionString(dict, "searchExpiry")->Option.getExn(
            ~message="searchExpiry not found",
          ),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SearchResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: searchResp) => {
  req->asJson
}
