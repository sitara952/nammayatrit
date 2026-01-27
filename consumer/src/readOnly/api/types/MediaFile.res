open Enums
open Utils

@genType
type mediaFile = {
  _type: FileType.fileType,
  createdAt: string,
  id: string,
  s3FilePath: option<string>,
  url: string,
}

let decodeMediaFile = data => {
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
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          s3FilePath: getOptionString(dict, "s3FilePath"),
          url: getOptionString(dict, "url")->Option.getExn(~message="url not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MediaFile ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: mediaFile) => {
  req->asJson
}
