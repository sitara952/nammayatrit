open PriceAPIEntity
open Utils

@genType
type fRFSDiscountRes = {
  code: string,
  description: string,
  eligibility: bool,
  price: priceAPIEntity,
  title: string,
  tnc: string,
}

let decodeFRFSDiscountRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          eligibility: getOptionBool(dict, "eligibility")->Option.getExn(
            ~message="eligibility not found",
          ),
          price: dict
          ->Dict.get("price")
          ->Option.getExn(~message="price is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="price is coming as undefined"),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
          tnc: getOptionString(dict, "tnc")->Option.getExn(~message="tnc not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSDiscountRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSDiscountRes) => {
  req->asJson
}
