open Enums
open Distance
open LatLong
open Utils

@genType
type autoCompleteReq = {
  autoCompleteType: option<AutoCompleteType.autoCompleteType>,
  input: string,
  language: Language.language,
  location: string,
  origin: option<latLong>,
  radius: int,
  radiusWithUnit: option<distance>,
  sessionToken: option<string>,
  strictbounds: option<bool>,
  types_: option<string>,
}

let decodeAutoCompleteReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          autoCompleteType: AutoCompleteType.decodeAutoCompleteTypeResult(
            dict,
            "autoCompleteType",
          )->Result.mapOr(None, x => Some(x)),
          input: getOptionString(dict, "input")->Option.getExn(~message="input not found"),
          language: Language.decodeLanguageResult(dict, "language")->Utils.getResultExn(
            ~message="language is coming as undefined",
          ),
          location: getOptionString(dict, "location")->Option.getExn(~message="location not found"),
          origin: dict
          ->Dict.get("origin")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          radius: getOptionInt(dict, "radius")->Option.getExn(~message="radius not found"),
          radiusWithUnit: dict
          ->Dict.get("radiusWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          sessionToken: getOptionString(dict, "sessionToken"),
          strictbounds: getOptionBool(dict, "strictbounds"),
          types_: getOptionString(dict, "types_"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AutoCompleteReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: autoCompleteReq) => {
  req->asJson
}
