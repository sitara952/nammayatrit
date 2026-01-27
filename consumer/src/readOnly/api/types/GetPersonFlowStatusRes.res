open FlowStatus
open Utils

@genType
type getPersonFlowStatusRes = {
  currentStatus: flowStatus,
  isValueAddNP: option<bool>,
  oldStatus: option<flowStatus>,
}

let decodeGetPersonFlowStatusRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          currentStatus: dict
          ->Dict.get("currentStatus")
          ->Option.getExn(~message="currentStatus is not found")
          ->decodeFlowStatus
          ->Utils.getResultExn(~message="currentStatus is coming as undefined"),
          isValueAddNP: getOptionBool(dict, "isValueAddNP"),
          oldStatus: dict
          ->Dict.get("oldStatus")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeFlowStatus(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPersonFlowStatusRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPersonFlowStatusRes) => {
  req->asJson
}
