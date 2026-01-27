open APISuccess
open ReactQuery
open EditResultBookingUpdateRequestIdConfirmPost

module Keys = {
  let all = ["editResultBookingUpdateRequestIdConfirmPost"]
}
let useEditResultBookingUpdateRequestIdConfirmPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (bookingUpdateRequestId: string) =>
      editResultBookingUpdateRequestIdConfirmPostApiCall((bookingUpdateRequestId: string)),
  })
}
//
