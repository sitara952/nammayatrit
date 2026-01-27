open InvoiceRes
open Utils

@genType
type invoiceResArray = array<invoiceRes>

let decodeInvoiceResArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeInvoiceRes(x)->Utils.getResultExn(~message="error in parsing invoiceRes")
      ),
    )
  } catch {
  | err => {
      Console.log2("InvoiceResArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: invoiceResArray) => {
  req->asJson
}
