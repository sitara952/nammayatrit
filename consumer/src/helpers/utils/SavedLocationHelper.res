open SavedLocationType
open FavouriteFlowTypes

let getLocationTitle = (item: tagConfig) => {
  switch item.tag {
  | ADD_HOME => "Home"
  | ADD_WORK => "Work"
  | FAV(val) =>
    switch val {
    | "Home" => "Home"
    | "Work" => "Work"
    | _ => val
    }
  }
}

let getLocationIcon = (
  item: tagConfig,
  favouriteList: array<FavouriteFlowTypes.favouriteListType>,
) => {
  switch item.tag {
  | FAV(val) =>
    switch val {
    | "Home" => favouriteList[0]
    | "Work" => favouriteList[1]
    | _ => favouriteList[2]
    }
  | ADD_HOME => favouriteList[0]
  | ADD_WORK => favouriteList[1]
  }
}

let getVariant = (item: tagConfig) => {
  switch item.tag {
  | FAV(val) =>
    switch val {
    | "Home" => DEFAULT
    | "Work" => DEFAULT
    | _ => FAVORITES
    }
  | ADD_HOME => DEFAULT
  | ADD_WORK => DEFAULT
  }
}

let getPlaceId = (item: tagConfig) =>
  Option.mapOr(item.locationData, None, location => location.placeId)

let getFill = (variant: FavouriteFlowTypes.variant) =>
  variant == DEFAULT
    ? ThemebasedStyle.colorString.fillPrimaryHigh
    : ThemebasedStyle.colorString.fillNegativeHigh

// For UI labelling
let getVariantTag = (item: tagConfig) => {
  switch item.tag {
  | FAV(val) =>
    switch val {
    | "Home" => HOME
    | "Work" => WORK
    | _ => OTHERS
    }
  | ADD_HOME => HOME
  | ADD_WORK => WORK
  }
}

let getUiTitle = (item: tagConfig) => {
  switch item.tag {
  | FAV(val) =>
    switch val {
    | "Home" => GetLocale.getLocale(HOME).text
    | "Work" => GetLocale.getLocale(WORK).text
    | _ => val
    }
  | ADD_HOME => GetLocale.getLocale(HOME).text
  | ADD_WORK => GetLocale.getLocale(WORK).text
  }
}

let getListItemType = (
  item: tagConfig,
  favouriteList: array<FavouriteFlowTypes.favouriteListType>,
  variant: FavouriteFlowTypes.variant,
) => {
  (
    getLocationTitle(item),
    getLocationIcon(item, favouriteList),
    getVariant(item),
    getPlaceId(item),
    getFill(variant),
    getUiTitle(item),
    item.tag,
  )
}

let getShortLocationAddress = (item: tagConfig) => {
  switch item.tag {
  | FAV(_) =>
    switch item.locationData {
    | Some(data) =>
      switch data.title {
      | Some(title) =>
        title ++
        switch data.subtitle {
        | Some(subtitle) => ", " ++ subtitle
        | None => ""
        }
      | None =>
        switch data.subtitle {
        | Some(subtitle) => subtitle
        | None => ""
        }
      }
    | None => ""
    }
  | _ => GetLocale.getLocale(ADD_ADDRESS).text
  }
}

let getDescription = (item: tagConfig) => {
  switch item.tag {
  | FAV(_) =>
    switch item.locationData {
    | Some(data) =>
      switch data.title {
      | Some(title) =>
        title ++
        switch data.subtitle {
        | Some(subtitle) => ", " ++ subtitle
        | None => ""
        }
      | None =>
        switch data.subtitle {
        | Some(subtitle) => subtitle
        | None => ""
        }
      }
    | None => ""
    }
  | _ => ""
  }
}

let closeAddFavBottomSheet = (context: FavouriteContext.favouriteContextType) => {
  BottomSheetWrapper.closeBottomSheet(context.addFavouriteBottomsheetRef)
  BottomSheetWrapper.collapseBottomSheet(context.addFavouriteBottomsheetRef)
}

let modifyContextState = (
  context: FavouriteContext.favouriteContextType,
  item: tagConfig,
  favouriteList: array<FavouriteFlowTypes.favouriteListType>,
  variant: FavouriteFlowTypes.variant,
) => {
  let (locationTitle, _, _, placeId, _, _, _) = getListItemType(item, favouriteList, variant)
  let description = getDescription(item)
  context.setAddFavouriteFromSearch(_ => false)
  context.setShowOptions(_ => true)
  context.setIsEditFavourite(_ => true)
  context.setDescription(_ => description)
  context.setDeleteTag(_ => locationTitle)
  context.setSearchTextInput(_ => description)
  context.setMapLocation(_ => item.locationData)
  context.setInputForm(_ => {
    name: locationTitle,
    placeId,
    address: getShortLocationAddress(item),
    variantTag: getVariantTag(item),
  })
  context.setDropLocation(_ => item.locationData)
  closeAddFavBottomSheet(context)
}
