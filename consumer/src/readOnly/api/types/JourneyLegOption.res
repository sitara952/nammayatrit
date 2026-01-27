open Distance
open JourneyLegRouteDetails
open Utils

@genType
type journeyLegOption = {
  arrivalTimes: array<int>,
  availableRoutes: array<string>,
  distance: option<distance>,
  duration: option<int>,
  fare: float,
  journeyLegId: string,
  routeDetails: array<journeyLegRouteDetails>,
}

let decodeJourneyLegOption = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          arrivalTimes: getOptionIntArrayFromDict(dict, "arrivalTimes")->Option.getExn(
            ~message="arrivalTimes not found",
          ),
          availableRoutes: getOptionStrArrayFromDict(dict, "availableRoutes")->Option.getExn(
            ~message="availableRoutes not found",
          ),
          distance: dict
          ->Dict.get("distance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          duration: getOptionInt(dict, "duration"),
          fare: getOptionFloat(dict, "fare")->Option.getExn(~message="fare not found"),
          journeyLegId: getOptionString(dict, "journeyLegId")->Option.getExn(
            ~message="journeyLegId not found",
          ),
          routeDetails: dict
          ->Dict.get("routeDetails")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="routeDetails is not of array")
          ->Array.map(x =>
            decodeJourneyLegRouteDetails(x)->Utils.getResultExn(
              ~message="routeDetails is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyLegOption ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyLegOption) => {
  req->asJson
}
