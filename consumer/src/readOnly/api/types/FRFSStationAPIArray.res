open FRFSStationAPI
open Utils

@genType
type fRFSStationAPIArray = array<fRFSStationAPI>

let decodeFRFSStationAPIArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFRFSStationAPI(x)->Utils.getResultExn(~message="error in parsing fRFSStationAPI")
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSStationAPIArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSStationAPIArray) => {
  req->asJson
}
