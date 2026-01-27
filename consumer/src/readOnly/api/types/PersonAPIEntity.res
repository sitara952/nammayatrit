open Enums
open Version
open Utils

@genType
type personAPIEntity = {
  businessEmail: option<string>,
  businessProfileVerified: option<bool>,
  bundleVersion: option<version>,
  clientVersion: option<version>,
  disability: option<string>,
  email: option<string>,
  firstName: option<string>,
  followsRide: bool,
  gender: Gender.gender,
  hasCompletedMockSafetyDrill: option<bool>,
  hasCompletedSafetySetup: bool,
  hasDisability: option<bool>,
  hasTakenRide: bool,
  hasTakenValidRide: bool,
  id: string,
  isSafetyCenterDisabled: bool,
  language: option<Language.language>,
  lastName: option<string>,
  maskedDeviceToken: option<string>,
  maskedMobileNumber: option<string>,
  middleName: option<string>,
  referralCode: option<string>,
  whatsappNotificationEnrollStatus: option<OptApiMethods.optApiMethods>,
  customerTags: option<Js.Dict.t<array<string>>>,
}

let decodePersonAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          businessEmail: getOptionString(dict, "businessEmail"),
          businessProfileVerified: getOptionBool(dict, "businessProfileVerified"),
          bundleVersion: dict
          ->Dict.get("bundleVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          clientVersion: dict
          ->Dict.get("clientVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          disability: getOptionString(dict, "disability"),
          email: getOptionString(dict, "email"),
          firstName: getOptionString(dict, "firstName"),
          followsRide: getOptionBool(dict, "followsRide")->Option.getExn(
            ~message="followsRide not found",
          ),
          gender: Gender.decodeGenderResult(dict, "gender")->Utils.getResultExn(
            ~message="gender is coming as undefined",
          ),
          hasCompletedMockSafetyDrill: getOptionBool(dict, "hasCompletedMockSafetyDrill"),
          hasCompletedSafetySetup: getOptionBool(dict, "hasCompletedSafetySetup")->Option.getExn(
            ~message="hasCompletedSafetySetup not found",
          ),
          hasDisability: getOptionBool(dict, "hasDisability"),
          hasTakenRide: getOptionBool(dict, "hasTakenRide")->Option.getExn(
            ~message="hasTakenRide not found",
          ),
          hasTakenValidRide: getOptionBool(dict, "hasTakenValidRide")->Option.getExn(
            ~message="hasTakenValidRide not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isSafetyCenterDisabled: getOptionBool(dict, "isSafetyCenterDisabled")->Option.getExn(
            ~message="isSafetyCenterDisabled not found",
          ),
          language: Language.decodeLanguageResult(dict, "language")->Result.mapOr(None, x => Some(
            x,
          )),
          lastName: getOptionString(dict, "lastName"),
          maskedDeviceToken: getOptionString(dict, "maskedDeviceToken"),
          maskedMobileNumber: getOptionString(dict, "maskedMobileNumber"),
          middleName: getOptionString(dict, "middleName"),
          referralCode: getOptionString(dict, "referralCode"),
          whatsappNotificationEnrollStatus: OptApiMethods.decodeOptApiMethodsResult(
            dict,
            "whatsappNotificationEnrollStatus",
          )->Result.mapOr(None, x => Some(x)),
          customerTags: dict
          ->Dict.get("customerTags")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, json => {
            try {
              switch Js.Json.decodeObject(json) {
              | Some(obj) => {
                  let result = Js.Dict.empty()
                  let keys = Js.Dict.keys(obj)
                  keys->Belt.Array.forEach(key => {
                    let value = Js.Dict.unsafeGet(obj, key)
                    switch Js.Json.decodeArray(value) {
                    | Some(arr) => {
                        let stringArray =
                          arr
                          ->Belt.Array.map(Js.Json.decodeString)
                          ->Belt.Array.keep(Belt.Option.isSome)
                          ->Belt.Array.map(Belt.Option.getExn)
                        Js.Dict.set(result, key, stringArray)
                      }
                    | None =>
                      switch Js.Json.decodeString(value) {
                      | Some(str) => Js.Dict.set(result, key, [str])
                      | None => ()
                      }
                    }
                  })
                  Some(result)
                }
              | None => None
              }
            } catch {
            | _ => None
            }
          }),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personAPIEntity) => {
  req->asJson
}
