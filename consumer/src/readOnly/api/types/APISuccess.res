open Enums
open Utils

@genType
type aPISuccess = {result: APISuccessResult.aPISuccessResult}

let decodeAPISuccess = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          result: APISuccessResult.decodeAPISuccessResultResult(dict, "result")->Utils.getResultExn(
            ~message="result is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("APISuccess ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: aPISuccess) => {
  req->asJson
}
