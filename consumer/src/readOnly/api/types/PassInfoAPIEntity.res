open PassAPIEntity
open PassCategoryAPIEntity
open PassTypeAPIEntity
open Utils

@genType
type passInfoAPIEntity = {
  passCategory: passCategoryAPIEntity,
  passTypes: array<passTypeAPIEntity>,
  passes: array<passAPIEntity>,
}

let decodePassInfoAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          passCategory: dict
          ->Dict.get("passCategory")
          ->Option.getExn(~message="passCategory is not found")
          ->decodePassCategoryAPIEntity
          ->Utils.getResultExn(~message="passCategory is coming as undefined"),
          passTypes: dict
          ->Dict.get("passTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="passTypes is not of array")
          ->Array.map(x =>
            decodePassTypeAPIEntity(x)->Utils.getResultExn(
              ~message="passTypes is coming as undefined",
            )
          ),
          passes: dict
          ->Dict.get("passes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="passes is not of array")
          ->Array.map(x =>
            decodePassAPIEntity(x)->Utils.getResultExn(~message="passes is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassInfoAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passInfoAPIEntity) => {
  req->asJson
}
