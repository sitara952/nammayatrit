open Utils

type setupIntentResponse = {
  setupIntentClientSecret: string,
  customerId: string,
  ephemeralKey: string,
}

type paymentIntentResponse = {
  paymentIntentClientSecret: string,
  customerId: string,
  ephemeralKey: string,
}

type customerCard = {
  cardId: string,
  brand: string,
  last4: int,
  expMonth: int,
  expYear: int,
  country: option<string>,
}

type currency = USD

type customerCardListResp = {list: array<customerCard>, defaultPaymentMethodId: option<string>}

type addTipAmount = {
  currency: currency,
  amount: float,
}

type addTipRequest = {amount: addTipAmount}

let decodeToSetupIntentResponse = dict => {
  try {
    Some({
      setupIntentClientSecret: getOptionString(dict, "setupIntentClientSecret")->Belt.Option.getExn,
      customerId: getOptionString(dict, "customerId")->Belt.Option.getExn,
      ephemeralKey: getOptionString(dict, "ephemeralKey")->Belt.Option.getExn,
    })
  } catch {
  | _ => None
  }
}

let decodeToPaymentIntentResponse = dict => {
  try {
    Some({
      paymentIntentClientSecret: getOptionString(
        dict,
        "paymentIntentClientSecret",
      )->Belt.Option.getExn,
      customerId: getOptionString(dict, "customerId")->Belt.Option.getExn,
      ephemeralKey: getOptionString(dict, "ephemeralKey")->Belt.Option.getExn,
    })
  } catch {
  | _ => None
  }
}

let decodeToCustomerCard = dict => {
  try {
    Some({
      cardId: getOptionString(dict, "cardId")->Belt.Option.getExn,
      brand: getOptionString(dict, "brand")->Belt.Option.getExn,
      last4: getOptionInt(dict, "last4")->Belt.Option.getExn,
      expMonth: getOptionInt(dict, "expMonth")->Belt.Option.getExn,
      expYear: getOptionInt(dict, "expYear")->Belt.Option.getExn,
      country: getOptionString(dict, "country"),
    })
  } catch {
  | _ => None
  }
}

let decodeToCustomerCardListResp = dict => {
  try {
    Some({
      list: getOptionalArrayFromDict(dict, "list")
      ->Option.getExn
      ->Array.map(json =>
        json->Core__JSON.Decode.object->Option.flatMap(decodeToCustomerCard)->Option.getExn
      ),
      defaultPaymentMethodId: getOptionString(dict, "defaultPaymentMethodId"),
    })
  } catch {
  | _ => None
  }
}

let encodeCurrency = req =>
  switch req {
  | USD => "USD"->JSON.Encode.string
  }

let encodeAddTipAmount = req =>
  Js.Dict.fromArray([
    ("currency", req.currency->encodeCurrency),
    ("amount", req.amount->encodeFloat),
  ])->Js.Json.object_

let encodeAddTipRequest = req =>
  Js.Dict.fromArray([("amount", req.amount->encodeAddTipAmount)])->Js.Json.object_
