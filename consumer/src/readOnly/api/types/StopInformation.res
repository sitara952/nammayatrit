open Utils

@genType
type stopInformation = {
  createdAt: string,
  id: string,
  merchantId: option<string>,
  merchantOperatingCityId: option<string>,
  rideId: string,
  stopId: string,
  stopOrder: int,
  updatedAt: string,
  waitingTimeEnd: option<string>,
  waitingTimeStart: string,
}

let decodeStopInformation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          merchantId: getOptionString(dict, "merchantId"),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId"),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
          stopId: getOptionString(dict, "stopId")->Option.getExn(~message="stopId not found"),
          stopOrder: getOptionInt(dict, "stopOrder")->Option.getExn(~message="stopOrder not found"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          waitingTimeEnd: getOptionString(dict, "waitingTimeEnd"),
          waitingTimeStart: getOptionString(dict, "waitingTimeStart")->Option.getExn(
            ~message="waitingTimeStart not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("StopInformation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: stopInformation) => {
  req->asJson
}
