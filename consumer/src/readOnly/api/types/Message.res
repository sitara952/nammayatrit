open Utils

@genType
type message = {
  id: string,
  label: string,
  mediaFileUrls: array<string>,
  message: string,
  messageAction: option<string>,
  messageTitle: option<string>,
  referenceCategoryId: option<string>,
  referenceOptionId: option<string>,
}

let decodeMessage = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          label: getOptionString(dict, "label")->Option.getExn(~message="label not found"),
          mediaFileUrls: getOptionStrArrayFromDict(dict, "mediaFileUrls")->Option.getExn(
            ~message="mediaFileUrls not found",
          ),
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          messageAction: getOptionString(dict, "messageAction"),
          messageTitle: getOptionString(dict, "messageTitle"),
          referenceCategoryId: getOptionString(dict, "referenceCategoryId"),
          referenceOptionId: getOptionString(dict, "referenceOptionId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Message ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: message) => {
  req->asJson
}
