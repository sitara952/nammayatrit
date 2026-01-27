open Enums
open Utils

@genType
type sDKPayloadDetails = {
  action: option<string>,
  amount: string,
  clientAuthToken: string,
  clientAuthTokenExpiry: string,
  clientId: option<string>,
  createMandate: option<MandateType.mandateType>,
  currency: Currency.currency,
  customerEmail: option<string>,
  customerId: option<string>,
  customerPhone: option<string>,
  description: option<string>,
  environment: option<string>,
  firstName: option<string>,
  lastName: option<string>,
  mandateEndDate: option<string>,
  mandateMaxAmount: option<string>,
  mandateStartDate: option<string>,
  merchantId: option<string>,
  options_getUpiDeepLinks: option<bool>,
  orderId: option<string>,
  returnUrl: option<string>,
}

let decodeSDKPayloadDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          action: getOptionString(dict, "action"),
          amount: getOptionString(dict, "amount")->Option.getExn(~message="amount not found"),
          clientAuthToken: getOptionString(dict, "clientAuthToken")->Option.getExn(
            ~message="clientAuthToken not found",
          ),
          clientAuthTokenExpiry: getOptionString(dict, "clientAuthTokenExpiry")->Option.getExn(
            ~message="clientAuthTokenExpiry not found",
          ),
          clientId: getOptionString(dict, "clientId"),
          createMandate: MandateType.decodeMandateTypeResult(
            dict,
            "createMandate",
          )->Result.mapOr(None, x => Some(x)),
          currency: Currency.decodeCurrencyResult(dict, "currency")->Utils.getResultExn(
            ~message="currency is coming as undefined",
          ),
          customerEmail: getOptionString(dict, "customerEmail"),
          customerId: getOptionString(dict, "customerId"),
          customerPhone: getOptionString(dict, "customerPhone"),
          description: getOptionString(dict, "description"),
          environment: getOptionString(dict, "environment"),
          firstName: getOptionString(dict, "firstName"),
          lastName: getOptionString(dict, "lastName"),
          mandateEndDate: getOptionString(dict, "mandateEndDate"),
          mandateMaxAmount: getOptionString(dict, "mandateMaxAmount"),
          mandateStartDate: getOptionString(dict, "mandateStartDate"),
          merchantId: getOptionString(dict, "merchantId"),
          options_getUpiDeepLinks: getOptionBool(dict, "options_getUpiDeepLinks"),
          orderId: getOptionString(dict, "orderId"),
          returnUrl: getOptionString(dict, "returnUrl"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SDKPayloadDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sDKPayloadDetails) => {
  req->asJson
}
