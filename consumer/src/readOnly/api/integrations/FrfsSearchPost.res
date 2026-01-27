open Enums
open FRFSSearchAPIReq
open FRFSSearchAPIRes
open Utils

let frfsSearchPostApiCall = async (
  vehicleType: FrfsSearchVehicleType.frfsSearchVehicleType,
  body: fRFSSearchAPIReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/frfs/search" ++
    ("?" ++
    "&vehicleType=" ++
    vehicleType->FrfsSearchVehicleType.frfsSearchVehicleTypeToString),
    ~body=body->FRFSSearchAPIReq.toJson,
  )
  FRFSSearchAPIRes.decodeFRFSSearchAPIRes(data)
}
