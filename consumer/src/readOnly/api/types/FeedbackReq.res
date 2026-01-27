open Utils

@genType
type feedbackAnswerItem = {
  questionId: string,
  answer: array<string>,
}

@genType
type feedbackReq = {
  feedbackDetails: option<string>,
  mbAudio: option<string>,
  nightSafety: option<bool>,
  rating: int,
  rideId: string,
  shouldFavDriver: option<bool>,
  wasOfferedAssistance: option<bool>,
  feedbackAnswers: option<array<feedbackAnswerItem>>,
}

let decodeFeedbackAnswerItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          questionId: getOptionString(dict, "questionId")->Option.getExn(
            ~message="questionId not found",
          ),
          answer: getOptionStrArrayFromDict(dict, "answer")->Option.getExn(
            ~message="answer not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackAnswerItem ERROR", err)
      Error(err)
    }
  }
}

let decodeFeedbackReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          feedbackDetails: getOptionString(dict, "feedbackDetails"),
          mbAudio: getOptionString(dict, "mbAudio"),
          nightSafety: getOptionBool(dict, "nightSafety"),
          rating: getOptionInt(dict, "rating")->Option.getExn(~message="rating not found"),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
          shouldFavDriver: getOptionBool(dict, "shouldFavDriver"),
          wasOfferedAssistance: getOptionBool(dict, "wasOfferedAssistance"),
          feedbackAnswers: dict
          ->Dict.get("feedbackAnswers")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFeedbackAnswerItem(x)->Utils.getResultExn(~message="feedback answer item error")
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackReq) => {
  req->asJson
}
