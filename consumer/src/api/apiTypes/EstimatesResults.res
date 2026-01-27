type selectedQuote = {selectedQuotes: array<SearchResults.quoteAPIEntity>}

type estimateResultsResp = {
  selectedQuotes: option<selectedQuote>,
  bookingId: option<string>,
}

let getSelectedQuotes = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    SearchResults.getQuoteAPIEntity(dict)
  })
}

let defaultSelectedQuote = {selectedQuotes: []}

let getSelectedQuotes = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {selectedQuotes: getSelectedQuotes(dict, "selectedQuotes")}
  })
}

let itemToObjectMapper = resp => {
  let dict = Utils.getDictFromJson(resp)
  {
    selectedQuotes: getSelectedQuotes(dict, "selectedQuotes"),
    bookingId: Utils.getOptionString(dict, "bookingId"),
  }
}
