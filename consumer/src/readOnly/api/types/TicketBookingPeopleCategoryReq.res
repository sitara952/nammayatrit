open Utils

@genType
type ticketBookingPeopleCategoryReq = {
  numberOfUnits: int,
  peopleCategoryId: string,
}

let decodeTicketBookingPeopleCategoryReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          numberOfUnits: getOptionInt(dict, "numberOfUnits")->Option.getExn(
            ~message="numberOfUnits not found",
          ),
          peopleCategoryId: getOptionString(dict, "peopleCategoryId")->Option.getExn(
            ~message="peopleCategoryId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingPeopleCategoryReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingPeopleCategoryReq) => {
  req->asJson
}
