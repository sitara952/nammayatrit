open GetQuotesRes
open Utils

let rideSearchSearchIdResultsGetApiCall = async (searchId: string, allowMultiple: option<bool>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/rideSearch" ++
    "/" ++
    searchId ++
    "/" ++
    "results" ++
    ("?" ++
    Option.mapOr(allowMultiple, "", x => "&allowMultiple=" ++ x->boolToString)),
  )
  GetQuotesRes.decodeGetQuotesRes(data)
}
