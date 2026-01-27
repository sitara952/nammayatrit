open Enums
open Disability
open MarketingParams
open Version
open Utils

@genType
type updateProfileReq = {
  androidId: option<string>,
  bundleVersion: option<version>,
  businessEmail: option<string>,
  clientVersion: option<version>,
  dateOfBirth: option<string>,
  deviceId: option<string>,
  deviceToken: option<string>,
  disability: option<disability>,
  email: option<string>,
  enableOtpLessRide: option<bool>,
  firstName: option<string>,
  gender: option<Gender.gender>,
  hasDisability: option<bool>,
  language: option<Language.language>,
  lastName: option<string>,
  latestLat: option<float>,
  latestLon: option<float>,
  liveActivityToken: option<string>,
  marketingParams: option<marketingParams>,
  middleName: option<string>,
  notificationToken: option<string>,
  profilePicture: option<string>,
  referralCode: option<string>,
  registrationLat: option<float>,
  registrationLon: option<float>,
  verificationChannel: option<string>,
}

let decodeUpdateProfileReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          androidId: getOptionString(dict, "androidId"),
          bundleVersion: dict
          ->Dict.get("bundleVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          businessEmail: getOptionString(dict, "businessEmail"),
          clientVersion: dict
          ->Dict.get("clientVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          dateOfBirth: getOptionString(dict, "dateOfBirth"),
          deviceId: getOptionString(dict, "deviceId"),
          deviceToken: getOptionString(dict, "deviceToken"),
          disability: dict
          ->Dict.get("disability")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDisability(x)->Result.mapOr(None, x => Some(x))),
          email: getOptionString(dict, "email"),
          enableOtpLessRide: getOptionBool(dict, "enableOtpLessRide"),
          firstName: getOptionString(dict, "firstName"),
          gender: Gender.decodeGenderResult(dict, "gender")->Result.mapOr(None, x => Some(x)),
          hasDisability: getOptionBool(dict, "hasDisability"),
          language: Language.decodeLanguageResult(dict, "language")->Result.mapOr(None, x => Some(
            x,
          )),
          lastName: getOptionString(dict, "lastName"),
          latestLat: getOptionFloat(dict, "latestLat"),
          latestLon: getOptionFloat(dict, "latestLon"),
          liveActivityToken: getOptionString(dict, "liveActivityToken"),
          marketingParams: dict
          ->Dict.get("marketingParams")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMarketingParams(x)->Result.mapOr(None, x => Some(x))),
          middleName: getOptionString(dict, "middleName"),
          notificationToken: getOptionString(dict, "notificationToken"),
          profilePicture: getOptionString(dict, "profilePicture"),
          referralCode: getOptionString(dict, "referralCode"),
          registrationLat: getOptionFloat(dict, "registrationLat"),
          registrationLon: getOptionFloat(dict, "registrationLon"),
          verificationChannel: getOptionString(dict, "verificationChannel"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdateProfileReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updateProfileReq) => {
  req->asJson
}
