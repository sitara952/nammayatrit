open Utils

@genType
type cumulativeOfferResp = {
  offerDescription: string,
  offerIds: array<string>,
  offerSponsoredBy: array<string>,
  offerTitle: string,
}

let decodeCumulativeOfferResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          offerDescription: getOptionString(dict, "offerDescription")->Option.getExn(
            ~message="offerDescription not found",
          ),
          offerIds: getOptionStrArrayFromDict(dict, "offerIds")->Option.getExn(
            ~message="offerIds not found",
          ),
          offerSponsoredBy: getOptionStrArrayFromDict(dict, "offerSponsoredBy")->Option.getExn(
            ~message="offerSponsoredBy not found",
          ),
          offerTitle: getOptionString(dict, "offerTitle")->Option.getExn(
            ~message="offerTitle not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CumulativeOfferResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cumulativeOfferResp) => {
  req->asJson
}
