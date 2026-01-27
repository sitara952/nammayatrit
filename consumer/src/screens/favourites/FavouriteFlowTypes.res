type variant = DEFAULT | FAVORITES

type favTag = HOME | WORK | OTHERS

type action = [#add(favTag)]

type params = {action: action}

type listItemType = {
  locationTitle: string,
  uiTitle: string,
  locationAddress: string,
  locationIcon: option<React.element>,
  handlePress: unit => unit,
  variant: variant,
  placeId: option<string>,
  savedLocTag: SavedLocationType.savedLocTag,
}

type favouriteListType = {
  title: string,
  icon: (~fill: string) => React.element,
  favTag: favTag,
}

type favInputForm = {
  name: string,
  address: string,
  variantTag: favTag,
  placeId: option<string>,
}
type tagExists = {
  home: bool,
  work: bool,
}
