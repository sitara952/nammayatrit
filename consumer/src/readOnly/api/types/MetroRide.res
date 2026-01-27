open MetroStation
open ScheduleElement
open Utils

@genType
type metroRide = {
  arrivalStation: metroStation,
  departureStation: metroStation,
  price: int,
  schedule: array<scheduleElement>,
}

let decodeMetroRide = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          arrivalStation: dict
          ->Dict.get("arrivalStation")
          ->Option.getExn(~message="arrivalStation is not found")
          ->decodeMetroStation
          ->Utils.getResultExn(~message="arrivalStation is coming as undefined"),
          departureStation: dict
          ->Dict.get("departureStation")
          ->Option.getExn(~message="departureStation is not found")
          ->decodeMetroStation
          ->Utils.getResultExn(~message="departureStation is coming as undefined"),
          price: getOptionInt(dict, "price")->Option.getExn(~message="price not found"),
          schedule: dict
          ->Dict.get("schedule")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="schedule is not of array")
          ->Array.map(x =>
            decodeScheduleElement(x)->Utils.getResultExn(~message="schedule is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MetroRide ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metroRide) => {
  req->asJson
}
