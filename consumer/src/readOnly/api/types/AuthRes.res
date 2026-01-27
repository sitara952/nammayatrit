open Enums
open PersonAPIEntity
open Utils

@genType
type authRes = {
  attempts: int,
  authId: string,
  authType: LoginType.loginType,
  isPersonBlocked: bool,
  person: option<personAPIEntity>,
  token: option<string>,
}

let decodeAuthRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          attempts: getOptionInt(dict, "attempts")->Option.getExn(~message="attempts not found"),
          authId: getOptionString(dict, "authId")->Option.getExn(~message="authId not found"),
          authType: LoginType.decodeLoginTypeResult(dict, "authType")->Utils.getResultExn(
            ~message="authType is coming as undefined",
          ),
          isPersonBlocked: getOptionBool(dict, "isPersonBlocked")->Option.getExn(
            ~message="isPersonBlocked not found",
          ),
          person: dict
          ->Dict.get("person")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePersonAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          token: getOptionString(dict, "token"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AuthRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: authRes) => {
  req->asJson
}
