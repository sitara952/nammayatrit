open Utils

@genType
type towerInfo = {
  areaCode: int,
  cellId: string,
  cellType: string,
  isRegistered: bool,
  networkType: string,
  signalStrength: int,
}

let decodeTowerInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          areaCode: getOptionInt(dict, "areaCode")->Option.getExn(~message="areaCode not found"),
          cellId: getOptionString(dict, "cellId")->Option.getExn(~message="cellId not found"),
          cellType: getOptionString(dict, "cellType")->Option.getExn(~message="cellType not found"),
          isRegistered: getOptionBool(dict, "isRegistered")->Option.getExn(
            ~message="isRegistered not found",
          ),
          networkType: getOptionString(dict, "networkType")->Option.getExn(
            ~message="networkType not found",
          ),
          signalStrength: getOptionInt(dict, "signalStrength")->Option.getExn(
            ~message="signalStrength not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TowerInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: towerInfo) => {
  req->asJson
}
