open Utils
type recents = {recentSearches: array<LocationTypes.location>}
let mmkv = MMKV.createMMKV()

let getList = dict => {
  dict
  ->JSON.parseExn
  ->getDictFromJson
  ->Dict.get("recentSearches")
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => LocationUtils.itemToObjectMapper(dict))
}

let fetchRecents = async () => {
  let recentsFromStore = await EncryptedStorage.getItem(RECENT_SEARCHES)
  switch recentsFromStore {
  | Some(recents) => {
      let recents = getList(recents)
      Some(recents)
    }
  | None => None
  }
}

let setRecents = async (recents: array<LocationTypes.location>) => {
  let recentsJson = {recentSearches: recents}->asJson
  await EncryptedStorage.setItem(RECENT_SEARCHES, recentsJson->JSON.stringify)
}

let filterRecents = (
  recents: option<array<LocationTypes.location>>,
  recentSearch: LocationTypes.location,
) => {
  recents
  ->Option.getOr([])
  ->Array.filter(location => {
    location.placeId !== recentSearch.placeId
  })
}

let setRecentSearches = (prevRecents, locToBeAdded) => {
  let uniqueRecents = filterRecents(prevRecents, locToBeAdded)
  let newArray = if uniqueRecents->Array.length >= Constants.recent_searches_limit {
    removeLastElement(uniqueRecents)
  } else {
    uniqueRecents
  }
  let recents = Array.concat([locToBeAdded], newArray)
  setRecents(recents)->ignore
  recents
}
