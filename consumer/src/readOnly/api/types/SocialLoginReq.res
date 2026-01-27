open Enums
open Utils

@genType
type socialLoginReq = {
  email: option<string>,
  enableOtpLessRide: option<bool>,
  merchantId: string,
  merchantShortId: string,
  name: option<string>,
  oauthProvider: OAuthProvider.oAuthProvider,
  registrationLat: option<float>,
  registrationLon: option<float>,
  tokenId: string,
}

let decodeSocialLoginReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          email: getOptionString(dict, "email"),
          enableOtpLessRide: getOptionBool(dict, "enableOtpLessRide"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          merchantShortId: getOptionString(dict, "merchantShortId")->Option.getExn(
            ~message="merchantShortId not found",
          ),
          name: getOptionString(dict, "name"),
          oauthProvider: OAuthProvider.decodeOAuthProviderResult(
            dict,
            "oauthProvider",
          )->Utils.getResultExn(~message="oauthProvider is coming as undefined"),
          registrationLat: getOptionFloat(dict, "registrationLat"),
          registrationLon: getOptionFloat(dict, "registrationLon"),
          tokenId: getOptionString(dict, "tokenId")->Option.getExn(~message="tokenId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SocialLoginReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: socialLoginReq) => {
  req->asJson
}
