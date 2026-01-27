open GetConfigResp
open Utils

let frfsPartnerOrganizationGetConfigFromStationFromGMMStationIdToStationToGMMStationIdGetApiCall = async (
  fromGMMStationId: string,
  toGMMStationId: string,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/partnerOrganization/getConfig/fromStation" ++
    "/" ++
    fromGMMStationId ++
    "/" ++
    "toStation" ++
    "/" ++
    toGMMStationId ++
    "/" ++ "",
  )
  GetConfigResp.decodeGetConfigResp(data)
}
