open APISuccess
open FeedbackFormReq
open ReactQuery
open FeedbackSubmitPost

module Keys = {
  let all = ["feedbackSubmitPost"]
}
let useFeedbackSubmitPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: feedbackFormReq) => feedbackSubmitPostApiCall((body: feedbackFormReq)),
  })
}
