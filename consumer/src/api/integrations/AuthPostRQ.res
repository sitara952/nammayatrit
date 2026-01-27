open AuthReq
open ReactQuery
open AuthPost

module Keys = {
  let all = ["authPost"]
}
let useAuthPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: authReq) => authPostApiCall((body: authReq)),
  })
}
