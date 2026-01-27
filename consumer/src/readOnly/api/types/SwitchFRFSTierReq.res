open Utils

@genType
type switchFRFSTierReq = {quoteId: string}

let decodeSwitchFRFSTierReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SwitchFRFSTierReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: switchFRFSTierReq) => {
  req->asJson
}
