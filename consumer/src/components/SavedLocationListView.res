open ReactNative
open Style
open FavouriteFlowTypes
open ReactNavigation

@react.component
let make = (
  ~navigation: Core.navigation,
  ~onPress: LocationTypes.location => unit,
  ~itemList: array<SavedLocationType.tagConfig>,
) => {
  let (location, _, _, fetchLocationAndServiceability) = UseLocationDetails.useLocationDetails()
  let handleItemPress = (item: SavedLocationType.tagConfig, fetchLocationAndServiceability) => {
    switch item.tag {
    | FAV(_) =>
      item.locationData
      ->Option.map(locData => {
        fetchLocationAndServiceability(locData, 1)
      })
      ->ignore
    | ADD_HOME =>
      Core.Navigation.navigateWithParams(
        navigation,
        AppRoutes.navigationRouts.favouritesScreen,
        {action: #add(HOME)},
      )
    | ADD_WORK =>
      Core.Navigation.navigateWithParams(
        navigation,
        AppRoutes.navigationRouts.favouritesScreen,
        {action: #add(WORK)},
      )
    }
  }

  let renderItem = (item, fetchLocationAndServiceability) => {
    <>
      <TouchableTextWithIcon
        onPress={_ => handleItemPress(item, fetchLocationAndServiceability)}
        text={item.text}
        icon={Some(item.prefixImg)}
        textType={SBody_600}
        componentType={item.componentType}
        paddingVertical={if item.text == "" {
          7.->dp
        } else {
          6.->dp
        }}
      />
      <Space />
    </>
  }
  React.useEffect1(() => {
    switch location {
    | Some(location) => onPress(location)
    | None => ()
    }

    None
  }, [location])

  <View style={viewStyle(~flexDirection=#row, ())}>
    <FlatList
      horizontal=true
      showsHorizontalScrollIndicator=false
      keyExtractor={(_, i) => i->Int.toString}
      keyboardShouldPersistTaps={#handled}
      data=itemList
      renderItem={({item}) => renderItem(item, fetchLocationAndServiceability)}
    />
  </View>
}
