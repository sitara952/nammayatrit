open Utils
type feedbackReq = {
  rating: int,
  rideId: string,
  feedbackDetails: option<string>,
  wasOfferedAssistance: option<bool>,
}

let toJSON = req => {
  req->asJson
}

let jsonToFeedbackReq = data => {
  switch data->JSON.Decode.object {
  | Some(obj) =>
    Some({
      rating: getInt(obj, "rating", 0),
      rideId: getString(obj, "rideId", ""),
      feedbackDetails: getOptionString(obj, "feedbackDetails"),
      wasOfferedAssistance: getOptionBool(obj, "wasOfferedAssistance"),
    })
  | None => None
  }
}

let _ = jsonToFeedbackReq
