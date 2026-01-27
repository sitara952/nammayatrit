open Enums
open Utils

@genType
type cancelAPIResponse = {result: CancelAPIResponseResult.cancelAPIResponseResult}

let decodeCancelAPIResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          result: CancelAPIResponseResult.decodeCancelAPIResponseResultResult(
            dict,
            "result",
          )->Utils.getResultExn(~message="result is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancelAPIResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancelAPIResponse) => {
  req->asJson
}
