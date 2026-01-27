open Enums
open Utils

@genType
type mediaFile_ = {
  _type: FileType.fileType,
  url: string,
}

let decodeMediaFile_ = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: FileType.decodeFileTypeResult(dict, "_type")->Utils.getResultExn(
            ~message="_type is coming as undefined",
          ),
          url: getOptionString(dict, "url")->Option.getExn(~message="url not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MediaFile_ ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: mediaFile_) => {
  req->asJson
}
