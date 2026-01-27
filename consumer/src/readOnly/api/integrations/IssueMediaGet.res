open Utils

let issueMediaGetApiCall = async (filePath: string) => {
  let data = await ApiCall.callGetAPI'(~url="/issue/media" ++ ("?" ++ "&filePath=" ++ filePath))
  String.decodeString(data)
}
