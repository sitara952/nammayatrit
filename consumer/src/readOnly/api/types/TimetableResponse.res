open TimetableEntry
open Utils

@genType
type timetableResponse = {timetable: array<timetableEntry>}

let decodeTimetableResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          timetable: dict
          ->Dict.get("timetable")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="timetable is not of array")
          ->Array.map(x =>
            decodeTimetableEntry(x)->Utils.getResultExn(~message="timetable is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TimetableResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: timetableResponse) => {
  req->asJson
}
