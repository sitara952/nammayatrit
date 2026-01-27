open FRFSRouteAPI
open Utils

@genType
type fRFSRouteAPIArray = array<fRFSRouteAPI>

let decodeFRFSRouteAPIArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFRFSRouteAPI(x)->Utils.getResultExn(~message="error in parsing fRFSRouteAPI")
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSRouteAPIArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSRouteAPIArray) => {
  req->asJson
}
