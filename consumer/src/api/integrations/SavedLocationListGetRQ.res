open SavedReqLocationsListRes
open ReactQuery
open SavedLocationListGet

module Keys = {
  let all = ["savedLocationListGet"]
}
let useSavedLocationListGet = (~queryKey) => {
  useQuery({
    queryKey,
    queryFn: _ => savedLocationListGetApiCall(),
  })
}
