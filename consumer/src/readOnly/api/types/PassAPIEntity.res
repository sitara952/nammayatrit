open Enums
open Benefit
open Utils
open CumulativeOfferResp

@genType
type passAPIEntity = {
  amount: float,
  originalAmount: option<float>,
  autoApply: bool,
  benefit: option<benefit>,
  benefitDescription: string,
  code: string,
  documentsRequired: array<PassDocumentType.passDocumentType>,
  eligibility: bool,
  id: string,
  maxDays: option<int>,
  maxTrips: option<int>,
  name: option<string>,
  description: option<string>,
  offer: option<cumulativeOfferResp>,
  savings: option<float>,
  vehicleServiceTierType: array<FRFSServiceTierType.fRFSServiceTierType>,
}

let decodePassAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          originalAmount: getOptionFloat(dict, "originalAmount"),
          autoApply: getOptionBool(dict, "autoApply")->Option.getExn(
            ~message="autoApply not found",
          ),
          benefit: dict
          ->Dict.get("benefit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeBenefit(x)->Result.mapOr(None, x => Some(x))),
          benefitDescription: getOptionString(dict, "benefitDescription")->Option.getExn(
            ~message="benefitDescription not found",
          ),
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          documentsRequired: dict
          ->Dict.get("documentsRequired")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="documentsRequired not found")
          ->Array.map(x =>
            PassDocumentType.decodePassDocumentType(x)->Utils.getResultExn(
              ~message="documentsRequired is coming as undefined",
            )
          ),
          eligibility: getOptionBool(dict, "eligibility")->Option.getExn(
            ~message="eligibility not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          maxDays: getOptionInt(dict, "maxDays"),
          maxTrips: getOptionInt(dict, "maxTrips"),
          name: getOptionString(dict, "name"),
          description: getOptionString(dict, "description"),
          offer: dict
          ->Dict.get("offer")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCumulativeOfferResp(x)->Result.mapOr(None, x => Some(x))),
          savings: getOptionFloat(dict, "savings"),
          vehicleServiceTierType: dict
          ->Dict.get("vehicleServiceTierType")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="vehicleServiceTierType not found")
          ->Array.map(x =>
            FRFSServiceTierType.decodeFRFSServiceTierType(x)->Utils.getResultExn(
              ~message="vehicleServiceTierType is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passAPIEntity) => {
  req->asJson
}
