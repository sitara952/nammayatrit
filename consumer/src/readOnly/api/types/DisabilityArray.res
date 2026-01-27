open Disability
open Utils

@genType
type disabilityArray = array<disability>

let decodeDisabilityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeDisability(x)->Utils.getResultExn(~message="error in parsing disability")
      ),
    )
  } catch {
  | err => {
      Console.log2("DisabilityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: disabilityArray) => {
  req->asJson
}
