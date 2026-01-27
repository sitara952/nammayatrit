open APISuccess
open FeedbackReq
open ReactQuery
open FeedbackRateRidePost

module Keys = {
  let all = ["feedbackRateRidePost"]
}
let useFeedbackRateRidePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: feedbackReq) => feedbackRateRidePostApiCall((body: feedbackReq)),
  })
}
