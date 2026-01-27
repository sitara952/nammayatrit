open Enums
open PriceAPIEntity
open QuoteCategoryMetadata
open Utils

@genType
type categoryInfoResponse = {
  categoryId: string,
  categoryMeta: option<quoteCategoryMetadata>,
  categoryName: FRFSQuoteCategoryType.fRFSQuoteCategoryType,
  categoryOfferedPrice: priceAPIEntity,
  categoryPrice: priceAPIEntity,
  categorySelectedQuantity: option<int>,
}

let decodeCategoryInfoResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categoryId: getOptionString(dict, "categoryId")->Option.getExn(
            ~message="categoryId not found",
          ),
          categoryMeta: dict
          ->Dict.get("categoryMeta")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeQuoteCategoryMetadata(x)->Result.mapOr(None, x => Some(x))
          ),
          categoryName: FRFSQuoteCategoryType.decodeFRFSQuoteCategoryTypeResult(
            dict,
            "categoryName",
          )->Utils.getResultExn(~message="categoryName is coming as undefined"),
          categoryOfferedPrice: dict
          ->Dict.get("categoryOfferedPrice")
          ->Option.getExn(~message="categoryOfferedPrice is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="categoryOfferedPrice is coming as undefined"),
          categoryPrice: dict
          ->Dict.get("categoryPrice")
          ->Option.getExn(~message="categoryPrice is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="categoryPrice is coming as undefined"),
          categorySelectedQuantity: getOptionInt(dict, "categorySelectedQuantity"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CategoryInfoResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: categoryInfoResponse) => {
  req->asJson
}
