open Utils

type issueCategoryRes = {
  category: string,
  categoryType: string,
  isRideRequired: bool,
  issueCategoryId: string,
  label: string,
  logoUrl: string,
  maxAllowedRideAge: int,
}

type issueCategoryListResType = {categories: array<issueCategoryRes>}

let getCategories = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.keepMap(Js.Json.decodeObject)
  ->Js.Array2.map(dict => {
    {
      category: getOptionString(dict, "category")->Belt.Option.getExn,
      categoryType: getOptionString(dict, "categoryType")->Belt.Option.getExn,
      issueCategoryId: getOptionString(dict, "issueCategoryId")->Belt.Option.getExn,
      isRideRequired: getOptionBool(dict, "isRideRequired")->Belt.Option.getExn,
      label: getOptionString(dict, "label")->Belt.Option.getExn,
      logoUrl: getOptionString(dict, "logoUrl")->Belt.Option.getExn,
      maxAllowedRideAge: getOptionInt(dict, "maxAllowedRideAge")->Belt.Option.getExn,
    }
  })
}

let decodeToIssueCategoryListResType = dict => {
  try {
    Some({
      categories: getCategories(dict, "categories"),
    })
  } catch {
  | _ => None
  }
}

let encodeIssueCategoryRes = req =>
  Js.Dict.fromArray([
    ("category", req.category->encodeString),
    ("categoryType", req.categoryType->encodeString),
    ("isRideRequired", req.isRideRequired->encodeBool),
    ("issueCategoryId", req.issueCategoryId->encodeString),
    ("label", req.label->encodeString),
    ("logoUrl", req.logoUrl->encodeString),
    ("maxAllowedRideAge", req.maxAllowedRideAge->encodeInt),
  ])->Js.Json.object_
let encodeIssueCategoryListResType = req =>
  Js.Dict.fromArray([
    ("categories", req.categories->Array.map(encodeIssueCategoryRes)->JSON.Encode.array),
  ])->Js.Json.object_

type chatType =
  | IssueMessage
  | IssueOption
  | MediaFile
  | IssueDescription

type chat = {
  chatId: string,
  chatType: chatType,
  timeStamp: string,
}

type issueReportReqtype = {
  categoryId: string,
  chats: array<chat>,
  createTicket: bool,
  description: string,
  mediaFiles: array<string>,
  optionId: option<string>,
  rideId: option<string>,
}

let encodeChatType = req =>
  switch req {
  | IssueMessage => "IssueMessage"->JSON.Encode.string
  | IssueOption => "IssueOption"->JSON.Encode.string
  | MediaFile => "MediaFile"->JSON.Encode.string
  | IssueDescription => "IssueDescription"->JSON.Encode.string
  }
let encodeChat = req =>
  Js.Dict.fromArray([
    ("chatId", req.chatId->encodeString),
    ("chatType", req.chatType->encodeChatType),
    ("timeStamp", req.timeStamp->encodeString),
  ])->Js.Json.object_

let encodeIssueReportReqtype = req =>
  Js.Dict.fromArray([
    ("categoryId", req.categoryId->encodeString),
    ("chats", req.chats->Array.map(encodeChat)->JSON.Encode.array),
    ("createTicket", req.createTicket->encodeBool),
    ("description", req.description->encodeString),
    ("mediaFiles", req.mediaFiles->encodeStrArray),
    ("optionId", req.optionId->encodeOptionString),
    ("rideId", req.rideId->encodeOptionString),
  ])->Js.Json.object_

type message = {
  id: string,
  message: string,
  label: option<string>,
}

type issueReportRes = {
  issueReportId: string,
  issueReportShortId: option<string>,
  messages: array<message>,
}

let getMessages = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.keepMap(Js.Json.decodeObject)
  ->Js.Array2.map(dict => {
    {
      id: getOptionString(dict, "id")->Belt.Option.getExn,
      message: getOptionString(dict, "message")->Belt.Option.getExn,
      label: getOptionString(dict, "label"),
    }
  })
}

let decodeToIssueReportRes = dict => {
  try {
    Some({
      issueReportId: getOptionString(dict, "issueReportId")->Belt.Option.getExn,
      issueReportShortId: getOptionString(dict, "issueReportShortId"),
      messages: getMessages(dict, "messages"),
    })
  } catch {
  | _ => None
  }
}
