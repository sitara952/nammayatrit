@genType
open AutoCompleteResp
open AutoCompleteReq
open ReactQuery
open MapsAutoCompletePost

module Keys = {
  let all = ["mapsAutoCompletePost"]
}
let useMapsAutoCompletePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: autoCompleteReq) => mapsAutoCompletePostApiCall((body: autoCompleteReq)),
  })
}
