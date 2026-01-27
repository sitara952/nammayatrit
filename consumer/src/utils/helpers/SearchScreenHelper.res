@genType
let getFormattedAddress = location => {
  let descArr = String.split(location, ", ")
  let len = Array.length(descArr)
  String.trim(Array.join(Array.slice(descArr, ~start=0, ~end=len - 3), ","))
}

@genType
let constructInputVal = (location: option<LocationTypes.location>) => {
  switch location {
  | Some(loc) =>
    switch (loc.title, loc.subtitle) {
    | (Some(title), Some(subtitle)) => Some(title ++ ", " ++ getFormattedAddress(subtitle))
    | (Some(title), None) => Some(title)
    | (None, Some(subtitle)) => Some(subtitle)
    | _ => None
    }
  | None => None
  }
}
