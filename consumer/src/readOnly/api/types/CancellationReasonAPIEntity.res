open Utils

@genType
type cancellationReasonAPIEntity = {
  description: string,
  reasonCode: string,
}

let decodeCancellationReasonAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          reasonCode: getOptionString(dict, "reasonCode")->Option.getExn(
            ~message="reasonCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancellationReasonAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancellationReasonAPIEntity) => {
  req->asJson
}
