open TowerInfo
open Utils

@genType
type towerInfoReq = {
  latLngAccuracy: float,
  timeStamp: string,
  towerInfo: array<towerInfo>,
  userLat: float,
  userLng: float,
}

let decodeTowerInfoReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          latLngAccuracy: getOptionFloat(dict, "latLngAccuracy")->Option.getExn(
            ~message="latLngAccuracy not found",
          ),
          timeStamp: getOptionString(dict, "timeStamp")->Option.getExn(
            ~message="timeStamp not found",
          ),
          towerInfo: dict
          ->Dict.get("towerInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="towerInfo is not of array")
          ->Array.map(x =>
            decodeTowerInfo(x)->Utils.getResultExn(~message="towerInfo is coming as undefined")
          ),
          userLat: getOptionFloat(dict, "userLat")->Option.getExn(~message="userLat not found"),
          userLng: getOptionFloat(dict, "userLng")->Option.getExn(~message="userLng not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TowerInfoReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: towerInfoReq) => {
  req->asJson
}
