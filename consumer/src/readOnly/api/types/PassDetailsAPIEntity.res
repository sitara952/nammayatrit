open PassAPIEntity
open PassCategoryAPIEntity
open PassTypeAPIEntity
open Utils

@genType
type passDetailsAPIEntity = {
  category: passCategoryAPIEntity,
  passDetails: passAPIEntity,
  passType: passTypeAPIEntity,
}

let decodePassDetailsAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          category: dict
          ->Dict.get("category")
          ->Option.getExn(~message="category is not found")
          ->decodePassCategoryAPIEntity
          ->Utils.getResultExn(~message="category is coming as undefined"),
          passDetails: dict
          ->Dict.get("passDetails")
          ->Option.getExn(~message="passDetails is not found")
          ->decodePassAPIEntity
          ->Utils.getResultExn(~message="passDetails is coming as undefined"),
          passType: dict
          ->Dict.get("passType")
          ->Option.getExn(~message="passType is not found")
          ->decodePassTypeAPIEntity
          ->Utils.getResultExn(~message="passType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassDetailsAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passDetailsAPIEntity) => {
  req->asJson
}
