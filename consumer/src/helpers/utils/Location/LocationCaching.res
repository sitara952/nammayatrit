open LocationTypes
open LocationUtils
open MMKV

let mmkv = MMKV.createMMKV()

@genType
module LocationObjectCaching = {
  let getList = dict => {
    dict
    ->JSON.parseExn
    ->JSON.Decode.array
    ->Option.getOr([])
    ->Array.filterMap(JSON.Decode.object)
    ->Array.map(dict => {
      itemToObjectMapper(dict)
    })
  }

  @genType
  let fetchRecents = () => {
    let recentsFromStore = MMKV.getStringItem(mmkv, RECENT_SEARCHES)
    switch recentsFromStore {
    | Some(recents) => {
        let recents = getList(recents)
        Some(recents)
      }
    | None => None
    }
  }

  let setRecents = (recents: array<location>) => {
    let recentsJson = recents->Utils.asJson->JSON.stringify
    MMKV.setStringItem(mmkv, RECENT_SEARCHES, recentsJson)
  }

  let filterRecents = (recents: option<array<location>>, recentSearch: location) => {
    recents
    ->Option.getOr([])
    ->Array.filter(location => {
      location.placeId !== recentSearch.placeId
    })
  }

  let setRecentSearches = (locToBeAdded: location) => {
    let prevRecents = fetchRecents()
    let uniqueRecents = filterRecents(prevRecents, locToBeAdded)
    let newArray = if uniqueRecents->Array.length >= Constants.recent_searches_limit {
      Utils.removeLastElement(uniqueRecents)
    } else {
      uniqueRecents
    }
    let recents = Array.concat([locToBeAdded], newArray)
    setRecents(recents)->ignore
    recents
  }
}

module SearchLocationObjectCaching = {
  let getList = dict => {
    dict
    ->JSON.parseExn
    ->JSON.Decode.array
    ->Option.getOr([])
    ->Array.filterMap(JSON.Decode.object)
    ->Array.map(dict => itemToObjectMapperSearchObject(dict))
  }

  let fetchSaved = () => {
    let recentsFromStore = MMKV.getStringItem(mmkv, SUGGESTED_LOCATIONS)
    switch recentsFromStore {
    | Some(recents) => {
        let recents = getList(recents)
        Some(recents)
      }
    | None => None
    }
  }

  let setSaved = (recents: array<searchLocationObject>) => {
    let recentsJson = recents->Utils.asJson->JSON.stringify
    MMKV.setStringItem(mmkv, SUGGESTED_LOCATIONS, recentsJson)
  }

  let filterSaved = (
    recents: option<array<searchLocationObject>>,
    recentSearch: searchLocationObject,
  ) => {
    recents
    ->Option.getOr([])
    ->Array.filter(location => {
      location.source.placeId !== recentSearch.source.placeId &&
        location.destination.placeId !== recentSearch.destination.placeId
    })
  }

  let setSavedLocations = (locToBeAdded: searchLocationObject) => {
    let prevRecents = fetchSaved()
    let uniqueRecents = filterSaved(prevRecents, locToBeAdded)
    let newArray = if uniqueRecents->Array.length >= Constants.recent_searches_limit {
      Utils.removeLastElement(uniqueRecents)
    } else {
      uniqueRecents
    }
    let recents = Array.concat([locToBeAdded], newArray)
    setSaved(recents)->ignore
    recents
  }
}
