open Enums
open Version
open Utils

@genType
type profileRes = {
  aadhaarVerified: bool,
  androidId: option<string>,
  bundleVersion: option<version>,
  businessEmail: option<string>,
  businessProfileVerified: option<bool>,
  cancellationRate: option<int>,
  clientVersion: option<version>,
  customerReferralCode: option<string>,
  deviceId: option<string>,
  disability: option<string>,
  email: option<string>,
  firstName: option<string>,
  followsRide: bool,
  frontendConfigHash: option<string>,
  gender: Gender.gender,
  hasCompletedMockSafetyDrill: option<bool>,
  hasCompletedSafetySetup: bool,
  hasDisability: option<bool>,
  hasTakenRide: bool,
  hasTakenValidAmbulanceRide: bool,
  hasTakenValidAutoRide: bool,
  hasTakenValidBikeRide: bool,
  hasTakenValidBusRide: bool,
  hasTakenValidCabRide: bool,
  hasTakenValidRide: bool,
  hasTakenValidTruckRide: bool,
  id: string,
  isBlocked: bool,
  isMultimodalRider: bool,
  isPayoutEnabled: option<bool>,
  isSafetyCenterDisabled: bool,
  language: option<Language.language>,
  lastName: option<string>,
  maskedDeviceToken: option<string>,
  maskedMobileNumber: option<string>,
  middleName: option<string>,
  payoutVpa: option<string>,
  publicTransportVersion: option<string>,
  referralAmountPaid: option<float>,
  referralCode: option<string>,
  referralEarnings: option<float>,
  referredByEarnings: option<float>,
  whatsappNotificationEnrollStatus: option<OptApiMethods.optApiMethods>,
  profilePicture: option<string>,
  customerTags: option<Js.Dict.t<array<string>>>,
}

let decodeProfileRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          aadhaarVerified: getOptionBool(dict, "aadhaarVerified")->Option.getExn(
            ~message="aadhaarVerified not found",
          ),
          androidId: getOptionString(dict, "androidId"),
          bundleVersion: dict
          ->Dict.get("bundleVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          businessEmail: getOptionString(dict, "businessEmail"),
          businessProfileVerified: getOptionBool(dict, "businessProfileVerified"),
          cancellationRate: getOptionInt(dict, "cancellationRate"),
          clientVersion: dict
          ->Dict.get("clientVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          customerReferralCode: getOptionString(dict, "customerReferralCode"),
          deviceId: getOptionString(dict, "deviceId"),
          disability: getOptionString(dict, "disability"),
          email: getOptionString(dict, "email"),
          firstName: getOptionString(dict, "firstName"),
          followsRide: getOptionBool(dict, "followsRide")->Option.getExn(
            ~message="followsRide not found",
          ),
          frontendConfigHash: getOptionString(dict, "frontendConfigHash"),
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
          hasTakenValidAmbulanceRide: getOptionBool(
            dict,
            "hasTakenValidAmbulanceRide",
          )->Option.getExn(~message="hasTakenValidAmbulanceRide not found"),
          hasTakenValidAutoRide: getOptionBool(dict, "hasTakenValidAutoRide")->Option.getExn(
            ~message="hasTakenValidAutoRide not found",
          ),
          hasTakenValidBikeRide: getOptionBool(dict, "hasTakenValidBikeRide")->Option.getExn(
            ~message="hasTakenValidBikeRide not found",
          ),
          hasTakenValidBusRide: getOptionBool(dict, "hasTakenValidBusRide")->Option.getExn(
            ~message="hasTakenValidBusRide not found",
          ),
          hasTakenValidCabRide: getOptionBool(dict, "hasTakenValidCabRide")->Option.getExn(
            ~message="hasTakenValidCabRide not found",
          ),
          hasTakenValidRide: getOptionBool(dict, "hasTakenValidRide")->Option.getExn(
            ~message="hasTakenValidRide not found",
          ),
          hasTakenValidTruckRide: getOptionBool(dict, "hasTakenValidTruckRide")->Option.getExn(
            ~message="hasTakenValidTruckRide not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isBlocked: getOptionBool(dict, "isBlocked")->Option.getExn(
            ~message="isBlocked not found",
          ),
          isMultimodalRider: getOptionBool(dict, "isMultimodalRider")->Option.getExn(
            ~message="isMultimodalRider not found",
          ),
          isPayoutEnabled: getOptionBool(dict, "isPayoutEnabled"),
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
          payoutVpa: getOptionString(dict, "payoutVpa"),
          publicTransportVersion: getOptionString(dict, "publicTransportVersion"),
          referralAmountPaid: getOptionFloat(dict, "referralAmountPaid"),
          referralCode: getOptionString(dict, "referralCode"),
          referralEarnings: getOptionFloat(dict, "referralEarnings"),
          referredByEarnings: getOptionFloat(dict, "referredByEarnings"),
          profilePicture: getOptionString(dict, "profilePicture"),
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
      Console.log2("ProfileRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: profileRes) => {
  req->asJson
}
