open Utils

@genType
type isIntercityResp = {
  isCrossCity: bool,
  isInterCity: bool,
}

let decodeIsIntercityResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isCrossCity: getOptionBool(dict, "isCrossCity")->Option.getExn(
            ~message="isCrossCity not found",
          ),
          isInterCity: getOptionBool(dict, "isInterCity")->Option.getExn(
            ~message="isInterCity not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IsIntercityResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: isIntercityResp) => {
  req->asJson
}
