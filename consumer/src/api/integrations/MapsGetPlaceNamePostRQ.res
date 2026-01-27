open PlaceNameArray
open GetPlaceNameReq
open ReactQuery
open MapsGetPlaceNamePost

module Keys = {
  let all = ["mapsGetPlaceNamePost"]
}
let useMapsGetPlaceNamePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: getPlaceNameReq) => mapsGetPlaceNamePostApiCall((body: getPlaceNameReq)),
  })
}
