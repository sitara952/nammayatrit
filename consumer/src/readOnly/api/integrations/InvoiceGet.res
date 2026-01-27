open InvoiceResArray
open Utils

let invoiceGetApiCall = async (from: string, to: string) => {
  let data = await ApiCall.callGetAPI'(~url="/invoice" ++ ("?" ++ "&from=" ++ from ++ "&to=" ++ to))
  InvoiceResArray.decodeInvoiceResArray(data)
}
