open Enums
open Utils

@genType
type upcomingBusInfo = {
  arrivalTimeInSeconds: int,
  routeCode: string,
  serviceType: FRFSServiceTierType.fRFSServiceTierType,
}

let decodeUpcomingBusInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          arrivalTimeInSeconds: getOptionInt(dict, "arrivalTimeInSeconds")->Option.getExn(
            ~message="arrivalTimeInSeconds not found",
          ),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          serviceType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceType",
          )->Utils.getResultExn(~message="serviceType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpcomingBusInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upcomingBusInfo) => {
  req->asJson
}
