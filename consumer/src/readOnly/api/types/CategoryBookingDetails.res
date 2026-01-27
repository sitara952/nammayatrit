open Enums
open Utils

@genType
type categoryBookingDetails = {
  categoryName: FRFSQuoteCategoryType.fRFSQuoteCategoryType,
  categorySelectedQuantity: int,
}

let decodeCategoryBookingDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categoryName: FRFSQuoteCategoryType.decodeFRFSQuoteCategoryTypeResult(
            dict,
            "categoryName",
          )->Utils.getResultExn(~message="categoryName is coming as undefined"),
          categorySelectedQuantity: getOptionInt(dict, "categorySelectedQuantity")->Option.getExn(
            ~message="categorySelectedQuantity not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CategoryBookingDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: categoryBookingDetails) => {
  req->asJson
}
