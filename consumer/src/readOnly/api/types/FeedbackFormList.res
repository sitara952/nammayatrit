open FeedbackFormAPIEntity
open Utils

@genType
type feedbackFormList = {_data: array<feedbackFormAPIEntity>}

let decodeFeedbackFormList = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _data: dict
          ->Dict.get("_data")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="_data is not of array")
          ->Array.map(x =>
            decodeFeedbackFormAPIEntity(x)->Utils.getResultExn(
              ~message="_data is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackFormList ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackFormList) => {
  req->asJson
}
