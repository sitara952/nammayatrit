open Utils

@genType
type issue = {
  bookingId: option<string>,
  contactEmail: option<string>,
  createdAt: string,
  customerId: string,
  description: string,
  firstName: option<string>,
  id: string,
  lastName: option<string>,
  mobileNumber: option<string>,
  reason: string,
  updatedAt: string,
}

let decodeIssue = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId"),
          contactEmail: getOptionString(dict, "contactEmail"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          customerId: getOptionString(dict, "customerId")->Option.getExn(
            ~message="customerId not found",
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          firstName: getOptionString(dict, "firstName"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          lastName: getOptionString(dict, "lastName"),
          mobileNumber: getOptionString(dict, "mobileNumber"),
          reason: getOptionString(dict, "reason")->Option.getExn(~message="reason not found"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Issue ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issue) => {
  req->asJson
}
