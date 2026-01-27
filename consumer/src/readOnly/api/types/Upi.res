open Utils

@genType
type upi = {
  payerApp: option<string>,
  payerAppName: option<string>,
  payerVpa: option<string>,
  txnFlowType: option<string>,
}

let decodeUpi = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          payerApp: getOptionString(dict, "payerApp"),
          payerAppName: getOptionString(dict, "payerAppName"),
          payerVpa: getOptionString(dict, "payerVpa"),
          txnFlowType: getOptionString(dict, "txnFlowType"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Upi ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upi) => {
  req->asJson
}
