open Utils

type priceAPIEntity = {
  amount: float,
  currency: string,
}

type select2req = {
  autoAssignEnabled: bool,
  autoAssignEnabledV2: bool,
  paymentMethodId: string,
}

let select2reqType = req => {
  req->asJson->JSON.stringify->Some
}

let toJson = req => {
  req->asJson
}

// RESPONSE
type select2ApiResponse = {apiSuccess: string}

let itemToObjectMapper = dict => {
  {
    apiSuccess: getString(dict, "apiSuccess", ""),
  }
}

let encodeSelect2req = req =>
  Js.Dict.fromArray([
    ("autoAssignEnabled", req.autoAssignEnabled->encodeBool),
    ("autoAssignEnabledV2", req.autoAssignEnabledV2->encodeBool),
    ("paymentMethodId", req.paymentMethodId->encodeString),
  ])->Js.Json.object_
