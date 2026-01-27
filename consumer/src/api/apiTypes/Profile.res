open Utils
open Enums

type language =
  | ENGLISH
  | HINDI
  | KANNADA
  | TAMIL
  | MALAYALAM
  | BENGALI
  | FRENCH
  | TELUGU

type gender = MALE | FEMALE | OTHER | UNKNOWN | PREFER_NOT_TO_SAY

type userProfile = {
  id: string,
  firstName: option<string>,
  middleName: option<string>,
  lastName: option<string>,
  email: option<string>,
  maskedMobileNumber: option<string>,
  maskedDeviceToken: option<string>,
  hasTakenRide: bool,
  hasTakenValidRide: bool,
  hasTakenValidAutoRide: bool,
  hasTakenValidCabRide: bool,
  hasTakenValidBikeRide: bool,
  hasTakenValidAmbulanceRide: bool,
  referralCode: option<string>,
  language: option<Language.language>,
  hasDisability: option<bool>,
  disability: option<string>,
  gender: Gender.gender,
  hasCompletedSafetySetup: bool,
  hasCompletedMockSafetyDrill: option<bool>,
  followsRide: bool,
  frontendConfigHash: option<string>,
  isSafetyCenterDisabled: bool,
  customerReferralCode: option<string>,
  preferredPaymentMethodId: option<string>,
  customerTags: option<Js.Dict.t<array<string>>>,
}

let getGender = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeString)
  ->Belt.Option.map(dict => {
    None
    ->Belt.Option.orElse(
      switch dict {
      | "MALE" => Some(MALE)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "FEMALE" => Some(FEMALE)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "OTHER" => Some(OTHER)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "UNKNOWN" => Some(UNKNOWN)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "PREFER_NOT_TO_SAY" => Some(PREFER_NOT_TO_SAY)
      | _ => None
      },
    )
    ->Belt.Option.getExn
  })
  ->Belt.Option.getExn
}

let getLanguage = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeString)
  ->Belt.Option.map(dict => {
    None
    ->Belt.Option.orElse(
      switch dict {
      | "ENGLISH" => Some(ENGLISH)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "HINDI" => Some(HINDI)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "KANNADA" => Some(KANNADA)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "TAMIL" => Some(TAMIL)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "MALAYALAM" => Some(MALAYALAM)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "BENGALI" => Some(BENGALI)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "FRENCH" => Some(FRENCH)
      | _ => None
      },
    )
    ->Belt.Option.orElse(
      switch dict {
      | "TELUGU" => Some(TELUGU)
      | _ => None
      },
    )
    ->Belt.Option.getExn
  })
}

let mapToUserProfile = (profile: ProfileRes.profileRes): userProfile => {
  id: profile.id,
  firstName: profile.firstName,
  middleName: profile.middleName,
  lastName: profile.lastName,
  email: profile.email,
  maskedMobileNumber: profile.maskedMobileNumber,
  maskedDeviceToken: profile.maskedDeviceToken,
  hasTakenRide: profile.hasTakenRide,
  hasTakenValidRide: profile.hasTakenValidRide,
  hasTakenValidAutoRide: profile.hasTakenValidAutoRide,
  hasTakenValidCabRide: profile.hasTakenValidCabRide,
  hasTakenValidBikeRide: profile.hasTakenValidBikeRide,
  hasTakenValidAmbulanceRide: profile.hasTakenValidAmbulanceRide,
  referralCode: profile.referralCode,
  language: profile.language,
  hasDisability: profile.hasDisability,
  disability: profile.disability,
  gender: profile.gender,
  hasCompletedSafetySetup: profile.hasCompletedSafetySetup,
  hasCompletedMockSafetyDrill: profile.hasCompletedMockSafetyDrill,
  followsRide: profile.followsRide,
  frontendConfigHash: profile.frontendConfigHash,
  isSafetyCenterDisabled: profile.isSafetyCenterDisabled,
  customerReferralCode: profile.customerReferralCode,
  preferredPaymentMethodId: None,
  customerTags: profile.customerTags,
}
