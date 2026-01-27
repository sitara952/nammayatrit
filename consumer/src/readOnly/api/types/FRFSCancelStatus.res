open Utils

@genType
type fRFSCancelStatus = {
  cancellationCharges: option<float>,
  refundAmount: option<float>,
}

let decodeFRFSCancelStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cancellationCharges: getOptionFloat(dict, "cancellationCharges"),
          refundAmount: getOptionFloat(dict, "refundAmount"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSCancelStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSCancelStatus) => {
  req->asJson
}
