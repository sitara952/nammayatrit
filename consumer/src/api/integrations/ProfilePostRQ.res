open APISuccess
open UpdateProfileReq
open ReactQuery
open ProfilePost

module Keys = {
  let all = ["profilePost"]
}
let useProfilePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: updateProfileReq) => profilePostApiCall((body: updateProfileReq)),
  })
}
