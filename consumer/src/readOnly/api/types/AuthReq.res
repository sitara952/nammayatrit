open Enums
open Utils

@genType
type authReq = {
  allowBlockedUserLogin: option<bool>,
  deviceToken: option<string>,
  email: option<string>,
  enableOtpLessRide: option<bool>,
  firstName: option<string>,
  gender: option<Gender.gender>,
  identifierType: option<IdentifierType.identifierType>,
  language: option<Language.language>,
  lastName: option<string>,
  merchantId: string,
  middleName: option<string>,
  mobileCountryCode: option<string>,
  mobileNumber: option<string>,
  notificationToken: option<string>,
  otpChannel: option<OTPChannel.oTPChannel>,
  registrationLat: option<float>,
  registrationLon: option<float>,
  whatsappNotificationEnroll: option<OptApiMethods.optApiMethods>,
}

let decodeAuthReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowBlockedUserLogin: getOptionBool(dict, "allowBlockedUserLogin"),
          deviceToken: getOptionString(dict, "deviceToken"),
          email: getOptionString(dict, "email"),
          enableOtpLessRide: getOptionBool(dict, "enableOtpLessRide"),
          firstName: getOptionString(dict, "firstName"),
          gender: Gender.decodeGenderResult(dict, "gender")->Result.mapOr(None, x => Some(x)),
          identifierType: IdentifierType.decodeIdentifierTypeResult(
            dict,
            "identifierType",
          )->Result.mapOr(None, x => Some(x)),
          language: Language.decodeLanguageResult(dict, "language")->Result.mapOr(None, x => Some(
            x,
          )),
          lastName: getOptionString(dict, "lastName"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          middleName: getOptionString(dict, "middleName"),
          mobileCountryCode: getOptionString(dict, "mobileCountryCode"),
          mobileNumber: getOptionString(dict, "mobileNumber"),
          notificationToken: getOptionString(dict, "notificationToken"),
          otpChannel: OTPChannel.decodeOTPChannelResult(dict, "otpChannel")->Result.mapOr(
            None,
            x => Some(x),
          ),
          registrationLat: getOptionFloat(dict, "registrationLat"),
          registrationLon: getOptionFloat(dict, "registrationLon"),
          whatsappNotificationEnroll: OptApiMethods.decodeOptApiMethodsResult(
            dict,
            "whatsappNotificationEnroll",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AuthReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: authReq) => {
  req->asJson
}
