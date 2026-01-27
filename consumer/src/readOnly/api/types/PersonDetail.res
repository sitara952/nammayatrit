open Utils

@genType
type personDetail = {
  firstName: option<string>,
  lastName: option<string>,
  middleName: option<string>,
  mobileNumber: option<string>,
  personId: string,
}

let decodePersonDetail = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          firstName: getOptionString(dict, "firstName"),
          lastName: getOptionString(dict, "lastName"),
          middleName: getOptionString(dict, "middleName"),
          mobileNumber: getOptionString(dict, "mobileNumber"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonDetail ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personDetail) => {
  req->asJson
}
