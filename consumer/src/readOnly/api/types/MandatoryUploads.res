open Enums
open Utils

@genType
type mandatoryUploads = {
  fileType: FileType.fileType,
  limit: int,
}

let decodeMandatoryUploads = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fileType: FileType.decodeFileTypeResult(dict, "fileType")->Utils.getResultExn(
            ~message="fileType is coming as undefined",
          ),
          limit: getOptionInt(dict, "limit")->Option.getExn(~message="limit not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MandatoryUploads ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: mandatoryUploads) => {
  req->asJson
}
