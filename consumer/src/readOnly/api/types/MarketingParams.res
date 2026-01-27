open Enums
open Utils

@genType
type marketingParams = {
  gclId: option<string>,
  userType: option<UserType.userType>,
  utmCampaign: option<string>,
  utmContent: option<string>,
  utmCreativeFormat: option<string>,
  utmMedium: option<string>,
  utmSource: option<string>,
  utmTerm: option<string>,
  appName: option<string>,
}

let decodeMarketingParams = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gclId: getOptionString(dict, "gclId"),
          userType: UserType.decodeUserTypeResult(dict, "userType")->Result.mapOr(None, x => Some(
            x,
          )),
          utmCampaign: getOptionString(dict, "utmCampaign"),
          utmContent: getOptionString(dict, "utmContent"),
          utmCreativeFormat: getOptionString(dict, "utmCreativeFormat"),
          utmMedium: getOptionString(dict, "utmMedium"),
          utmSource: getOptionString(dict, "utmSource"),
          utmTerm: getOptionString(dict, "utmTerm"),
          appName: getOptionString(dict, "appName"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MarketingParams ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: marketingParams) => {
  req->asJson
}
