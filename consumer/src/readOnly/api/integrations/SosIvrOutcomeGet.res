open APISuccess
open Utils

let sosIvrOutcomeGetApiCall = async (
  callFrom: option<string>,
  callSid: option<string>,
  callStatus: option<string>,
  digits: option<string>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/sos/IvrOutcome" ++
    ("?" ++
    Option.mapOr(callFrom, "", x => "&callFrom=" ++ x) ++
    Option.mapOr(callSid, "", x => "&callSid=" ++ x) ++
    Option.mapOr(callStatus, "", x => "&callStatus=" ++ x) ++
    Option.mapOr(digits, "", x => "&digits=" ++ x)),
  )
  APISuccess.decodeAPISuccess(data)
}
