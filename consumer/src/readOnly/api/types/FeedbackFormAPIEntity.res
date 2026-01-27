open Enums
open FeedbackFormItem
open Utils

@genType
type feedbackFormAPIEntity = {
  questions: array<feedbackFormItem>,
  rating: int,
}

let decodeFeedbackFormAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          questions: dict
          ->Dict.get("questions")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="questions is not of array")
          ->Array.map(x =>
            decodeFeedbackFormItem(x)->Utils.getResultExn(
              ~message="questions item error",
            )
          ),
          rating: getOptionInt(dict, "rating")->Option.getExn(~message="rating not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackFormAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackFormAPIEntity) => {
  req->asJson
}
