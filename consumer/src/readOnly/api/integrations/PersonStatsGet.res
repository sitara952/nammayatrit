open PersonStatsRes
open Utils

let personStatsGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/personStats")
  PersonStatsRes.decodePersonStatsRes(data)
}
