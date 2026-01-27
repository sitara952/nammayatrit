open AutoCompleteReq
open AutoCompleteResp
open Utils

let mapsAutoCompletePostApiCall = async (body: autoCompleteReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/maps/autoComplete",
    ~body=body->AutoCompleteReq.toJson,
  )
  AutoCompleteResp.decodeAutoCompleteResp(data)
}
