type favouriteContextType = {
  addFavouriteBottomsheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
  setAddFavouriteFromSearch: (bool => bool) => unit,
  setShowOptions: (bool => bool) => unit,
  setIsEditFavourite: (bool => bool) => unit,
  setInputForm: (FavouriteFlowTypes.favInputForm => FavouriteFlowTypes.favInputForm) => unit,
  setSearchTextInput: (string => string) => unit,
  inputForm: FavouriteFlowTypes.favInputForm,
  setDescription: (string => string) => unit,
  description: string,
  tagExists: FavouriteFlowTypes.tagExists,
  setTagExists: (FavouriteFlowTypes.tagExists => FavouriteFlowTypes.tagExists) => unit,
  setDropLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
  setDeleteTag: (string => string) => unit,
  setShowMap: (bool => bool) => unit,
  showMap: bool,
  mapLocation: option<LocationTypes.location>,
  setMapLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
  setLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
}

let initContext: option<favouriteContextType> = None

let context = React.createContext(initContext)

module Provider = {
  let make = React.Context.provider(context)
}

@react.component
let make = (
  ~children,
  ~addFavouriteBottomsheetRef,
  ~setAddFavouriteFromSearch,
  ~setIsEditFavourite,
  ~setInputForm,
  ~setSearchTextInput,
  ~inputForm,
  ~description,
  ~setDescription,
  ~setDeleteTag,
  ~setTagExists,
  ~tagExists,
  ~setShowOptions,
  ~setDropLocation,
  ~setShowMap,
  ~showMap,
  ~mapLocation,
  ~setMapLocation,
  ~setLocation,
) => {
  let data: favouriteContextType = {
    addFavouriteBottomsheetRef,
    setAddFavouriteFromSearch,
    setIsEditFavourite,
    setInputForm,
    setSearchTextInput,
    inputForm,
    setDeleteTag,
    description,
    setDescription,
    setShowOptions,
    setDropLocation,
    tagExists,
    setTagExists,
    setShowMap,
    showMap,
    mapLocation,
    setMapLocation,
    setLocation,
  }
  <Provider value=Some(data)> {children} </Provider>
}
