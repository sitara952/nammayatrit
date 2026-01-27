open GetFareReq
open GetFareResp
open Utils

let frfsPartnerOrganizationUpsertPersonAndGetFarePostApiCall = async (body: getFareReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/frfs/partnerOrganization/upsertPersonAndGetFare",
    ~body=body->GetFareReq.toJson,
  )
  GetFareResp.decodeGetFareResp(data)
}
