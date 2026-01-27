open PersonAPIEntity
open Utils

@genType
type authVerifyRes = {
  person: personAPIEntity,
  token: string,
}

let decodeAuthVerifyRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          person: dict
          ->Dict.get("person")
          ->Option.getExn(~message="person is not found")
          ->decodePersonAPIEntity
          ->Utils.getResultExn(~message="person is coming as undefined"),
          token: getOptionString(dict, "token")->Option.getExn(~message="token not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AuthVerifyRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: authVerifyRes) => {
  req->asJson
}
