open Enums
open Utils

@genType
type upcomingVehicleInfo = {
  arrivalTimeInSeconds: int,
  nextAvailableTimings: array<string>,
  routeCode: string,
  serviceName: option<string>,
  serviceType: FRFSServiceTierType.fRFSServiceTierType,
  source: SourceType.sourceType,
}

let decodeUpcomingVehicleInfo = data => {
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
          nextAvailableTimings: getOptionStrArrayFromDict(
            dict,
            "nextAvailableTimings",
          )->Option.getExn(~message="nextAvailableTimings not found"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          serviceName: getOptionString(dict, "serviceName"),
          serviceType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceType",
          )->Utils.getResultExn(~message="serviceType is coming as undefined"),
          source: SourceType.decodeSourceTypeResult(dict, "source")->Utils.getResultExn(
            ~message="source is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpcomingVehicleInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upcomingVehicleInfo) => {
  req->asJson
}
