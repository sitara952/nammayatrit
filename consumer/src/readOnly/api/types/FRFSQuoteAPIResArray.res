open FRFSQuoteAPIRes
open Utils

@genType
type fRFSQuoteAPIResArray = array<fRFSQuoteAPIRes>

let decodeFRFSQuoteAPIResArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFRFSQuoteAPIRes(x)->Utils.getResultExn(~message="error in parsing fRFSQuoteAPIRes")
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSQuoteAPIResArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSQuoteAPIResArray) => {
  req->asJson
}
