open Utils

@genType
type passUploadProfilePictureReq = {
  imeiNumber: string,
  profilePicture: string,
  purchasedPassId: string,
}

let decodePassUploadProfilePictureReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          imeiNumber: getOptionString(dict, "imeiNumber")->Option.getExn(
            ~message="imeiNumber not found",
          ),
          profilePicture: getOptionString(dict, "profilePicture")->Option.getExn(
            ~message="profilePicture not found",
          ),
          purchasedPassId: getOptionString(dict, "purchasedPassId")->Option.getExn(
            ~message="purchasedPassId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassUploadProfilePictureReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passUploadProfilePictureReq) => {
  req->asJson
}
