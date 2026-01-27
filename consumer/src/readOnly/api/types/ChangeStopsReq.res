open StationAPIEntity
open Utils

@genType
type changeStopsReq = {
  journeyId: string,
  legOrder: int,
  newDestinationStation: option<stationAPIEntity>,
  newSourceStation: option<stationAPIEntity>,
}

let decodeChangeStopsReq = data => {
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
          newDestinationStation: dict
          ->Dict.get("newDestinationStation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeStationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          newSourceStation: dict
          ->Dict.get("newSourceStation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeStationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ChangeStopsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: changeStopsReq) => {
  req->asJson
}
