open GetPlaceNameReq
open PlaceNameArray
open Utils

let mapsGetPlaceNamePostApiCall = async (body: getPlaceNameReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/maps/getPlaceName",
    ~body=body->GetPlaceNameReq.toJson,
  )
  PlaceNameArray.decodePlaceNameArray(data)
}
