open Utils

@genType
type setRouteNameReq = {
  journeyId: string,
  legOrder: int,
  shortName: string,
}

let decodeSetRouteNameReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyId: getOptionString(dict, "journeyId")->Option.getExn(
            ~message="journeyId not found",
          ),
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SetRouteNameReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: setRouteNameReq) => {
  req->asJson
}
