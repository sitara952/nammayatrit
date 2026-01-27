open Utils

@genType
type feedbackAnswer = {
  answer: array<string>,
  questionId: string,
}

let decodeFeedbackAnswer = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          answer: getOptionStrArrayFromDict(dict, "answer")->Option.getExn(
            ~message="answer not found",
          ),
          questionId: getOptionString(dict, "questionId")->Option.getExn(
            ~message="questionId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackAnswer ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackAnswer) => {
  req->asJson
}
