open EditLocationResultAPIResp
open ReactQuery
open EditBookingUpdateRequestIdResultGet

module Keys = {
  let all = ["editBookingUpdateRequestIdResultGet"]
}
let useEditBookingUpdateRequestIdResultGet = (
  ~queryKey,
  bookingUpdateRequestId: string,
  refetchInterval,
) => {
  useQuery({
    queryKey,
    queryFn: _ => editBookingUpdateRequestIdResultGetApiCall((bookingUpdateRequestId: string)),
    refetchInterval,
  })
}
