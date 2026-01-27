open Utils

@genType
type peopleTicketQuantity = {
  bookedSeats: int,
  name: string,
}

let decodePeopleTicketQuantity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookedSeats: getOptionInt(dict, "bookedSeats")->Option.getExn(
            ~message="bookedSeats not found",
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PeopleTicketQuantity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: peopleTicketQuantity) => {
  req->asJson
}
