open Enums
open Utils

@genType
type triggerFcmReq = {
  body: string,
  channelId: option<string>,
  chatPersonId: string,
  showNotification: option<bool>,
  source: option<MessageSource.messageSource>,
  title: string,
}

let decodeTriggerFcmReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          body: getOptionString(dict, "body")->Option.getExn(~message="body not found"),
          channelId: getOptionString(dict, "channelId"),
          chatPersonId: getOptionString(dict, "chatPersonId")->Option.getExn(
            ~message="chatPersonId not found",
          ),
          showNotification: getOptionBool(dict, "showNotification"),
          source: MessageSource.decodeMessageSourceResult(dict, "source")->Result.mapOr(
            None,
            x => Some(x),
          ),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TriggerFcmReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: triggerFcmReq) => {
  req->asJson
}
