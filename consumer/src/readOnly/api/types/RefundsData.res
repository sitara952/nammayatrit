open Enums
open Utils

@genType
type refundsData = {
  amount: float,
  errorCode: option<string>,
  errorMessage: option<string>,
  idAssignedByServiceProvider: option<string>,
  initiatedBy: option<string>,
  requestId: string,
  status: RefundStatus.refundStatus,
}

let decodeRefundsData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          errorCode: getOptionString(dict, "errorCode"),
          errorMessage: getOptionString(dict, "errorMessage"),
          idAssignedByServiceProvider: getOptionString(dict, "idAssignedByServiceProvider"),
          initiatedBy: getOptionString(dict, "initiatedBy"),
          requestId: getOptionString(dict, "requestId")->Option.getExn(
            ~message="requestId not found",
          ),
          status: RefundStatus.decodeRefundStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RefundsData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: refundsData) => {
  req->asJson
}
