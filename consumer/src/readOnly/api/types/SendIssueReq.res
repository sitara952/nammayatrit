open Issue
open Utils

@genType
type sendIssueReq = {
  contactEmail: option<string>,
  issue: issue,
  nightSafety: option<bool>,
  rideBookingId: option<string>,
}

let decodeSendIssueReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contactEmail: getOptionString(dict, "contactEmail"),
          issue: dict
          ->Dict.get("issue")
          ->Option.getExn(~message="issue is not found")
          ->decodeIssue
          ->Utils.getResultExn(~message="issue is coming as undefined"),
          nightSafety: getOptionBool(dict, "nightSafety"),
          rideBookingId: getOptionString(dict, "rideBookingId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SendIssueReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sendIssueReq) => {
  req->asJson
}
