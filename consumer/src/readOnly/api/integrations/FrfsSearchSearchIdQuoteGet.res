open FRFSQuoteAPIResArray
open Utils

let frfsSearchSearchIdQuoteGetApiCall = async (searchId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/frfs/search" ++ "/" ++ searchId ++ "/" ++ "quote")
  FRFSQuoteAPIResArray.decodeFRFSQuoteAPIResArray(data)
}
