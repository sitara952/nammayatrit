open Utils

@genType
type errorObj = {
  errorCode: string,
  errorMessage: string,
}

let decodeErrorObj = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          errorCode: getOptionString(dict, "errorCode")->Option.getExn(
            ~message="errorCode not found",
          ),
          errorMessage: getOptionString(dict, "errorMessage")->Option.getExn(
            ~message="errorMessage not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ErrorObj ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: errorObj) => {
  req->asJson
}
