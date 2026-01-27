open FeedbackAnswer
open Utils

@genType
type feedbackFormReq = {
  feedback: array<feedbackAnswer>,
  rideId: string,
}

let decodeFeedbackFormReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          feedback: dict
          ->Dict.get("feedback")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="feedback is not of array")
          ->Array.map(x =>
            decodeFeedbackAnswer(x)->Utils.getResultExn(~message="feedback is coming as undefined")
          ),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackFormReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackFormReq) => {
  req->asJson
}
