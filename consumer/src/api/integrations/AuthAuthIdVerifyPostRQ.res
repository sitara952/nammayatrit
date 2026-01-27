open AuthVerifyReq
open ReactQuery
open AuthAuthIdVerifyPost

module Keys = {
  let all = ["authAuthIdVerifyPost"]
}
let useAuthAuthIdVerifyPost = (~mutationKey, ~authId: string, ~body: authVerifyReq) => {
  useMutation({
    mutationKey,
    mutationFn: _ => authAuthIdVerifyPostApiCall((authId: string), (body: authVerifyReq)),
  })
}
