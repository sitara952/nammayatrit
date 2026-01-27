open Enums
open GetPlaceNameBy
open Utils

@genType
type getPlaceNameReq = {
  getBy: getPlaceNameBy,
  language: option<Language.language>,
  sessionToken: option<string>,
}

let decodeGetPlaceNameReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          getBy: dict
          ->Dict.get("getBy")
          ->Option.getExn(~message="getBy is not found")
          ->decodeGetPlaceNameBy
          ->Utils.getResultExn(~message="getBy is coming as undefined"),
          language: Language.decodeLanguageResult(dict, "language")->Result.mapOr(None, x => Some(
            x,
          )),
          sessionToken: getOptionString(dict, "sessionToken"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPlaceNameReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPlaceNameReq) => {
  req->asJson
}
