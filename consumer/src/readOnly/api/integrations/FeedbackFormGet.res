open FeedbackFormList
open Utils

let feedbackFormGetApiCall = async (rating: option<int>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/feedback/form" ++
    ("?" ++
    Option.mapOr(rating, "", x => "&rating=" ++ x->Js.Int.toString)),
  )
  FeedbackFormList.decodeFeedbackFormList(data)
}
