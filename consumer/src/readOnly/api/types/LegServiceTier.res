open Enums
open PriceAPIEntity
open Utils

@genType
type legServiceTier = {
  fare: priceAPIEntity,
  quoteId: string,
  serviceTierDescription: string,
  serviceTierName: string,
  serviceTierType: FRFSServiceTierType.fRFSServiceTierType,
  trainTypeCode: option<string>,
  via: option<string>,
}

let decodeLegServiceTier = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fare: dict
          ->Dict.get("fare")
          ->Option.getExn(~message="fare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="fare is coming as undefined"),
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
          serviceTierDescription: getOptionString(dict, "serviceTierDescription")->Option.getExn(
            ~message="serviceTierDescription not found",
          ),
          serviceTierName: getOptionString(dict, "serviceTierName")->Option.getExn(
            ~message="serviceTierName not found",
          ),
          serviceTierType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Utils.getResultExn(~message="serviceTierType is coming as undefined"),
          trainTypeCode: getOptionString(dict, "trainTypeCode"),
          via: getOptionString(dict, "via"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegServiceTier ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legServiceTier) => {
  req->asJson
}
