open MandatoryUploads
open Utils

@genType
type issueOptionRes = {
  issueOptionId: string,
  label: string,
  mandatoryUploads: option<array<mandatoryUploads>>,
  option: string,
}

let decodeIssueOptionRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          issueOptionId: getOptionString(dict, "issueOptionId")->Option.getExn(
            ~message="issueOptionId not found",
          ),
          label: getOptionString(dict, "label")->Option.getExn(~message="label not found"),
          mandatoryUploads: dict
          ->Dict.get("mandatoryUploads")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeMandatoryUploads(x)->Utils.getResultExn(
                ~message="mandatoryUploads is coming as undefined",
              )
            )
          ),
          option: getOptionString(dict, "option")->Option.getExn(~message="option not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueOptionRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueOptionRes) => {
  req->asJson
}
