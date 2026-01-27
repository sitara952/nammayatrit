open Utils
type disability = {
  id: string,
  tag: string,
  description: string,
}

type updateProfileReq = {
  middleName: option<string>,
  lastName: option<string>,
  firstName: option<string>,
  email: option<string>,
  referralCode: option<string>,
  language: option<string>,
  gender: option<string>,
  disability: option<disability>,
  hasDisability: option<bool>,
}

let getDisability = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeObject)
  ->Belt.Option.map(dict => {
    {
      id: getOptionString(dict, "id")->Belt.Option.getExn,
      tag: getOptionString(dict, "tag")->Belt.Option.getExn,
      description: getOptionString(dict, "description")->Belt.Option.getExn,
    }
  })
}

let decodeToUpdateProfileReq = dict => {
  try {
    Some({
      middleName: getOptionString(dict, "middleName"),
      lastName: getOptionString(dict, "lastName"),
      firstName: getOptionString(dict, "firstName"),
      email: getOptionString(dict, "email"),
      referralCode: getOptionString(dict, "referralCode"),
      language: getOptionString(dict, "language"),
      gender: getOptionString(dict, "gender"),
      disability: getDisability(dict, "disability"),
      hasDisability: getOptionBool(dict, "hasDisability"),
    })
  } catch {
  | _ => None
  }
}

let encodeDisabilityOption = req =>
  if req == None {
    Js.Json.null
  } else {
    let req = req->Option.getExn
    Js.Dict.fromArray([
      ("id", req.id->encodeString),
      ("tag", req.tag->encodeString),
      ("description", req.description->encodeString),
    ])->Js.Json.object_
  }
let encodeUpdateProfileReq = req =>
  Js.Dict.fromArray([
    ("middleName", req.middleName->encodeOptionString),
    ("lastName", req.lastName->encodeOptionString),
    ("firstName", req.firstName->encodeOptionString),
    ("email", req.email->encodeOptionString),
    ("referralCode", req.referralCode->encodeOptionString),
    ("language", req.language->encodeOptionString),
    ("gender", req.gender->encodeOptionString),
    ("disability", req.disability->encodeDisabilityOption),
    ("hasDisability", req.hasDisability->encodeOptionBool),
  ])->Js.Json.object_

type updateProfileRes = {result: string}

let decodeToUpdateProfileRes = dict => {
  try {
    Some({result: getOptionString(dict, "result")->Belt.Option.getExn})
  } catch {
  | _ => None
  }
}

let encodeUpdateProfileRes = req =>
  Js.Dict.fromArray([("result", req.result->encodeString)])->Js.Json.object_

//same for update and edit profile
let mkUpdateProfileRequest = (
  ~middleName=None,
  ~lastName=None,
  ~firstName=None,
  ~email=None,
  ~referralCode=None,
  ~language=None,
  ~gender=None,
  ~disability=None,
  ~hasDisability=None,
) => {
  middleName,
  lastName,
  firstName,
  email,
  referralCode,
  language,
  gender,
  disability,
  hasDisability,
}
