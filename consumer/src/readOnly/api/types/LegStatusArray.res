open LegStatus
open Utils

@genType
type legStatusArray = array<legStatus>

let decodeLegStatusArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeLegStatus(x)->Utils.getResultExn(~message="error in parsing legStatus")
      ),
    )
  } catch {
  | err => {
      Console.log2("LegStatusArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legStatusArray) => {
  req->asJson
}
