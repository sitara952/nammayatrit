open AddSosVideoRes
open Utils

let sosSosIdUploadPostApiCall = async (sosId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/sos" ++ "/" ++ sosId ++ "/" ++ "upload")
  AddSosVideoRes.decodeAddSosVideoRes(data)
}
