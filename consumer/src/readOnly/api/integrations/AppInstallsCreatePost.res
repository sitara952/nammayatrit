open APISuccess
open AppInstallsReq
open Utils

let appInstallsCreatePostApiCall = async (body: appInstallsReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/appInstalls/create",
    ~body=body->AppInstallsReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
