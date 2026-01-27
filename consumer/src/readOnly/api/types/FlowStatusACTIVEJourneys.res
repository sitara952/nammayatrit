open Journey
open Utils

@genType
type flowStatusACTIVEJourneys = {journeys: option<array<journey>>}

let decodeFlowStatusACTIVEJourneys = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeys: dict
          ->Dict.get("journeys")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeJourney(x)->Utils.getResultExn(~message="journeys is coming as undefined")
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FlowStatusACTIVEJourneys ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: flowStatusACTIVEJourneys) => {
  req->asJson
}
