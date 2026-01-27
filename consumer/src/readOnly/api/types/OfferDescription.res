open Utils

@genType
type offerDescription = {
  description: option<string>,
  sponsoredBy: option<string>,
  title: option<string>,
  tnc: option<string>,
}

let decodeOfferDescription = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          description: getOptionString(dict, "description"),
          sponsoredBy: getOptionString(dict, "sponsoredBy"),
          title: getOptionString(dict, "title"),
          tnc: getOptionString(dict, "tnc"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OfferDescription ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: offerDescription) => {
  req->asJson
}
