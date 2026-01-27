open Utils

@genType
type switchRouteReq = {
  journeyId: string,
  legOrder: int,
  quoteId: string,
  routeCode: string,
  routeLongName: string,
  routeShortName: string,
}

let decodeSwitchRouteReq = data => {
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
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          routeLongName: getOptionString(dict, "routeLongName")->Option.getExn(
            ~message="routeLongName not found",
          ),
          routeShortName: getOptionString(dict, "routeShortName")->Option.getExn(
            ~message="routeShortName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SwitchRouteReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: switchRouteReq) => {
  req->asJson
}
