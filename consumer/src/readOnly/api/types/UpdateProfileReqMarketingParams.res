open Utils

@genType
type updateProfileReqMarketingParams = {
  gclId: option<string>,
  utmSource: option<string>,
  utmMedium: option<string>,
  utmCampaign: option<string>,
  utmTerm: option<string>,
  utmContent: option<string>,
  utmCreativeFormat: option<string>,
}

let decodeUpdateProfileReqMarketingParams = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gclId: getOptionString(dict, "gclId"),
          utmSource: getOptionString(dict, "utmSource"),
          utmMedium: getOptionString(dict, "utmMedium"),
          utmCampaign: getOptionString(dict, "utmCampaign"),
          utmTerm: getOptionString(dict, "utmTerm"),
          utmContent: getOptionString(dict, "utmContent"),
          utmCreativeFormat: getOptionString(dict, "utmCreativeFormat"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdateProfileReqMarketingParams ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updateProfileReqMarketingParams) => {
  req->asJson
}
