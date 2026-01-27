open Utils

@genType
type fRFSCategorySelectionReq = {
  quantity: int,
  quoteCategoryId: string,
}

let decodeFRFSCategorySelectionReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
          quoteCategoryId: getOptionString(dict, "quoteCategoryId")->Option.getExn(
            ~message="quoteCategoryId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSCategorySelectionReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSCategorySelectionReq) => {
  req->asJson
}
