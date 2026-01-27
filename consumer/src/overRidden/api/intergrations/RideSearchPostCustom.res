let rideSearchPostApiCall = async (
  _: option<string>,
  _: option<bool>,
  body: RideSearch.searchReqType,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideSearch",
    ~body=body->RideSearch.searchReqTypeToJson,
  )
  SearchResp.decodeSearchResp(data)
}
