open Enums
open FRFSConfigAPIRes
open Utils

let frfsConfigGetApiCall = async (city: FrfsConfigCity.frfsConfigCity) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/config" ++ ("?" ++ "&city=" ++ city->FrfsConfigCity.frfsConfigCityToString),
  )
  FRFSConfigAPIRes.decodeFRFSConfigAPIRes(data)
}
