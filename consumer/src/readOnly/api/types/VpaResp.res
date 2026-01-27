open Utils

@genType
type vpaResp = {
  isValid: bool,
  vpa: string,
}

let decodeVpaResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isValid: getOptionBool(dict, "isValid")->Option.getExn(~message="isValid not found"),
          vpa: getOptionString(dict, "vpa")->Option.getExn(~message="vpa not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VpaResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: vpaResp) => {
  req->asJson
}
