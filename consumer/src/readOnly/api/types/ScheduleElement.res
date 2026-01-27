open Utils

@genType
type scheduleElement = {
  arrivalTime: string,
  departureTime: string,
}

let decodeScheduleElement = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          arrivalTime: getOptionString(dict, "arrivalTime")->Option.getExn(
            ~message="arrivalTime not found",
          ),
          departureTime: getOptionString(dict, "departureTime")->Option.getExn(
            ~message="departureTime not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ScheduleElement ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: scheduleElement) => {
  req->asJson
}
