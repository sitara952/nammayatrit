open Utils

@genType
type journeySearchData = {
  agency: option<string>,
  convenienceCost: int,
  isDeleted: option<bool>,
  onSearchFailed: option<bool>,
  pricingId: option<string>,
}

let decodeJourneySearchData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          agency: getOptionString(dict, "agency"),
          convenienceCost: getOptionInt(dict, "convenienceCost")->Option.getExn(
            ~message="convenienceCost not found",
          ),
          isDeleted: getOptionBool(dict, "isDeleted"),
          onSearchFailed: getOptionBool(dict, "onSearchFailed"),
          pricingId: getOptionString(dict, "pricingId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneySearchData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeySearchData) => {
  req->asJson
}
