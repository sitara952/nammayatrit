open Enums
open PaymentLinks
open Utils

@genType
type paymentOrderAPIEntity = {
  action: option<string>,
  amount: float,
  clientAuthToken: option<string>,
  clientAuthTokenExpiry: option<string>,
  clientId: option<string>,
  createMandate: option<MandateType.mandateType>,
  createdAt: string,
  currency: Currency.currency,
  description: option<string>,
  environment: option<string>,
  getUpiDeepLinksOption: option<bool>,
  id: string,
  mandateEndDate: option<string>,
  mandateMaxAmount: option<float>,
  mandateStartDate: option<string>,
  merchantId: string,
  paymentLinks: paymentLinks,
  personId: string,
  requestId: option<string>,
  returnUrl: option<string>,
  service: option<string>,
  shortId: string,
  status: TransactionStatus.transactionStatus,
  updatedAt: string,
}

let decodePaymentOrderAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          action: getOptionString(dict, "action"),
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          clientAuthToken: getOptionString(dict, "clientAuthToken"),
          clientAuthTokenExpiry: getOptionString(dict, "clientAuthTokenExpiry"),
          clientId: getOptionString(dict, "clientId"),
          createMandate: MandateType.decodeMandateTypeResult(
            dict,
            "createMandate",
          )->Result.mapOr(None, x => Some(x)),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          currency: Currency.decodeCurrencyResult(dict, "currency")->Utils.getResultExn(
            ~message="currency is coming as undefined",
          ),
          description: getOptionString(dict, "description"),
          environment: getOptionString(dict, "environment"),
          getUpiDeepLinksOption: getOptionBool(dict, "getUpiDeepLinksOption"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          mandateEndDate: getOptionString(dict, "mandateEndDate"),
          mandateMaxAmount: getOptionFloat(dict, "mandateMaxAmount"),
          mandateStartDate: getOptionString(dict, "mandateStartDate"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          paymentLinks: dict
          ->Dict.get("paymentLinks")
          ->Option.getExn(~message="paymentLinks is not found")
          ->decodePaymentLinks
          ->Utils.getResultExn(~message="paymentLinks is coming as undefined"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          requestId: getOptionString(dict, "requestId"),
          returnUrl: getOptionString(dict, "returnUrl"),
          service: getOptionString(dict, "service"),
          shortId: getOptionString(dict, "shortId")->Option.getExn(~message="shortId not found"),
          status: TransactionStatus.decodeTransactionStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentOrderAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentOrderAPIEntity) => {
  req->asJson
}
