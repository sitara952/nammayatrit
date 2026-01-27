open Utils

@genType
type socialUpdateProfileReq = {
  email: string,
  firstName: option<string>,
  lastName: option<string>,
  mobileCountryCode: option<string>,
  mobileNumber: option<string>,
}

let decodeSocialUpdateProfileReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          email: getOptionString(dict, "email")->Option.getExn(~message="email not found"),
          firstName: getOptionString(dict, "firstName"),
          lastName: getOptionString(dict, "lastName"),
          mobileCountryCode: getOptionString(dict, "mobileCountryCode"),
          mobileNumber: getOptionString(dict, "mobileNumber"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SocialUpdateProfileReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: socialUpdateProfileReq) => {
  req->asJson
}
