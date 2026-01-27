open Utils

@genType
type issueUpdateReq = {
  categoryId: string,
  optionId: string,
}

let decodeIssueUpdateReq = data => {
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
          optionId: getOptionString(dict, "optionId")->Option.getExn(~message="optionId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueUpdateReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueUpdateReq) => {
  req->asJson
}
