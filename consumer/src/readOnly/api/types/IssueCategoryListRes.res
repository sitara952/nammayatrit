open IssueCategoryRes
open Utils

@genType
type issueCategoryListRes = {categories: array<issueCategoryRes>}

let decodeIssueCategoryListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeIssueCategoryRes(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueCategoryListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueCategoryListRes) => {
  req->asJson
}
