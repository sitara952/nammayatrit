open Enums
open Utils

@genType
type issueStatusUpdateReq = {
  customerRating: option<CustomerRating.customerRating>,
  customerResponse: option<CustomerResponse.customerResponse>,
  status: IssueStatus.issueStatus,
}

let decodeIssueStatusUpdateReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          customerRating: CustomerRating.decodeCustomerRatingResult(
            dict,
            "customerRating",
          )->Result.mapOr(None, x => Some(x)),
          customerResponse: CustomerResponse.decodeCustomerResponseResult(
            dict,
            "customerResponse",
          )->Result.mapOr(None, x => Some(x)),
          status: IssueStatus.decodeIssueStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueStatusUpdateReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueStatusUpdateReq) => {
  req->asJson
}
