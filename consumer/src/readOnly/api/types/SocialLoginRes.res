open Utils

@genType
type socialLoginRes = {
  isNew: bool,
  token: string,
}

let decodeSocialLoginRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isNew: getOptionBool(dict, "isNew")->Option.getExn(~message="isNew not found"),
          token: getOptionString(dict, "token")->Option.getExn(~message="token not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SocialLoginRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: socialLoginRes) => {
  req->asJson
}
