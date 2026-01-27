open Enums
open Utils

@genType
type refunds = {
  createdAt: string,
  errorCode: option<string>,
  errorMessage: option<string>,
  id: string,
  idAssignedByServiceProvider: option<string>,
  initiatedBy: option<string>,
  merchantId: string,
  orderId: string,
  refundAmount: float,
  shortId: string,
  status: RefundStatus.refundStatus,
  updatedAt: string,
}

let decodeRefunds = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          errorCode: getOptionString(dict, "errorCode"),
          errorMessage: getOptionString(dict, "errorMessage"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          idAssignedByServiceProvider: getOptionString(dict, "idAssignedByServiceProvider"),
          initiatedBy: getOptionString(dict, "initiatedBy"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          orderId: getOptionString(dict, "orderId")->Option.getExn(~message="orderId not found"),
          refundAmount: getOptionFloat(dict, "refundAmount")->Option.getExn(
            ~message="refundAmount not found",
          ),
          shortId: getOptionString(dict, "shortId")->Option.getExn(~message="shortId not found"),
          status: RefundStatus.decodeRefundStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Refunds ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: refunds) => {
  req->asJson
}
