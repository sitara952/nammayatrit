open Enums
open Utils

@genType
type timetableEntry = {
  serviceTierType: FRFSServiceTierType.fRFSServiceTierType,
  timeOfArrival: string,
  timeOfDeparture: string,
}

let decodeTimetableEntry = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          serviceTierType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Utils.getResultExn(~message="serviceTierType is coming as undefined"),
          timeOfArrival: getOptionString(dict, "timeOfArrival")->Option.getExn(
            ~message="timeOfArrival not found",
          ),
          timeOfDeparture: getOptionString(dict, "timeOfDeparture")->Option.getExn(
            ~message="timeOfDeparture not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TimetableEntry ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: timetableEntry) => {
  req->asJson
}
