open EstimateAPIEntity
open JourneyData
open LocationAPIEntity
open OfferRes
open PaymentMethodAPIEntity
open Utils

@genType
type getQuotesRes = {
  allJourneysLoaded: bool,
  estimates: array<estimateAPIEntity>,
  fromLocation: locationAPIEntity,
  journey: option<array<journeyData>>,
  paymentMethods: array<paymentMethodAPIEntity>,
  quotes: array<offerRes>,
  stops: array<locationAPIEntity>,
  toLocation: option<locationAPIEntity>,
}

let decodeGetQuotesRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allJourneysLoaded: getOptionBool(dict, "allJourneysLoaded")->Option.getExn(
            ~message="allJourneysLoaded not found",
          ),
          estimates: dict
          ->Dict.get("estimates")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="estimates is not of array")
          ->Array.map(x =>
            decodeEstimateAPIEntity(x)->Utils.getResultExn(
              ~message="estimates is coming as undefined",
            )
          ),
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          journey: dict
          ->Dict.get("journey")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeJourneyData(x)->Utils.getResultExn(~message="journey is coming as undefined")
            )
          ),
          paymentMethods: dict
          ->Dict.get("paymentMethods")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="paymentMethods is not of array")
          ->Array.map(x =>
            decodePaymentMethodAPIEntity(x)->Utils.getResultExn(
              ~message="paymentMethods is coming as undefined",
            )
          ),
          quotes: dict
          ->Dict.get("quotes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="quotes is not of array")
          ->Array.map(x =>
            decodeOfferRes(x)->Utils.getResultExn(~message="quotes is coming as undefined")
          ),
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stops is not of array")
          ->Array.map(x =>
            decodeLocationAPIEntity(x)->Utils.getResultExn(~message="stops is coming as undefined")
          ),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetQuotesRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getQuotesRes) => {
  req->asJson
}
