open APISuccess
open CreateSavedReqLocationReq
open ReactQuery
open SavedLocationPost

module Keys = {
  let all = ["savedLocationPost"]
}
let useSavedLocationPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: createSavedReqLocationReq) =>
      savedLocationPostApiCall((body: createSavedReqLocationReq)),
  })
}
