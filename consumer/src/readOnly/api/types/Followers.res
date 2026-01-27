open Utils

@genType
type followers = {
  bookingId: string,
  mobileNumber: string,
  name: option<string>,
  personId: string,
  priority: int,
}

let decodeFollowers = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          mobileNumber: getOptionString(dict, "mobileNumber")->Option.getExn(
            ~message="mobileNumber not found",
          ),
          name: getOptionString(dict, "name"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          priority: getOptionInt(dict, "priority")->Option.getExn(~message="priority not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Followers ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: followers) => {
  req->asJson
}
