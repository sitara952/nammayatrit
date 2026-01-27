open Utils

@genType
type issueMediaUploadRes = {fileId: string}

let decodeIssueMediaUploadRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fileId: getOptionString(dict, "fileId")->Option.getExn(~message="fileId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueMediaUploadRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueMediaUploadRes) => {
  req->asJson
}
