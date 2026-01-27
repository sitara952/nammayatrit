open ReactQuery
open AuthOtpAuthIdResendPost

module Keys = {
  let all = ["authOtpAuthIdResendPost"]
}
let useAuthOtpAuthIdResendPost = (~mutationKey, ~authId: string) => {
  useMutation({
    mutationKey,
    mutationFn: _ => authOtpAuthIdResendPostApiCall((authId: string)),
  })
}
