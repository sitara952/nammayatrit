open Utils

@genType
type contactsDetail = {
  personId: string,
  updateTime: string,
}

let decodeContactsDetail = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          updateTime: getOptionString(dict, "updateTime")->Option.getExn(
            ~message="updateTime not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ContactsDetail ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: contactsDetail) => {
  req->asJson
}
