open Utils

@genType
type insuranceAPIEntity = {
  certificateUrl: option<string>,
  message: string,
  plan: option<string>,
  policyId: option<string>,
  policyNumber: option<string>,
}

let decodeInsuranceAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          certificateUrl: getOptionString(dict, "certificateUrl"),
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          plan: getOptionString(dict, "plan"),
          policyId: getOptionString(dict, "policyId"),
          policyNumber: getOptionString(dict, "policyNumber"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("InsuranceAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: insuranceAPIEntity) => {
  req->asJson
}
