open Utils

@genType
type fRFSCanCancelStatus = {
  cancellationCharges: option<float>,
  isCancellable: option<bool>,
  refundAmount: option<float>,
}

let decodeFRFSCanCancelStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cancellationCharges: getOptionFloat(dict, "cancellationCharges"),
          isCancellable: getOptionBool(dict, "isCancellable"),
          refundAmount: getOptionFloat(dict, "refundAmount"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSCanCancelStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSCanCancelStatus) => {
  req->asJson
}
