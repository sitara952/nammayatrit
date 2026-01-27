open Reanimated
open ReactNative
open Tailwind
open Style

@react.component
let make = (
  ~searchTextInput: string,
  ~setLocation: (option<LocationTypes.location> => option<LocationTypes.location>) => unit,
) => {
  let favContext = React.useContext(FavouriteContext.context)

  switch favContext {
  | Some(favContext) =>
    let handleSetLocationPress = _ => {
      favContext.setShowMap(_ => true)
      Keyboard.dismiss()
    }
    <>
      <GorhomBottomSheet.BottomSheetView style={tw("flex-1")}>
        <ReanimatedView style={tw("relative mt-4 mx-4")}>
          <ReanimatedView style={tw("absolute left-4 top-4")}>
            <IconWrapper
              size="h-5"
              icon={() => <SearchIcon fill=ThemebasedStyle.colorString.fillPrimaryHigh />}
            />
          </ReanimatedView>
          <GorhomBottomSheet.BottomSheetTextInput
            onBlur={_ => ()}
            onFocus={_ => ()}
            style={array([
              tw(
                "text-[15px] font-bold border-[1px] border-borderPrimaryHigh py-4 pr-4 pl-[42px] rounded-2xl",
              ),
            ])}
            value={searchTextInput}
            multiline=false
            onChangeText={val => favContext.setSearchTextInput(_ => val)}
            placeholder=GetLocale.getLocale(SEARCH_FOR_AREA).text
            placeholderTextColor={ThemebasedStyle.colorClass.textMid}
          />
        </ReanimatedView>
        {searchTextInput->String.length >= 3
          ? <SearchResultList searchTextInput />
          : <AddCurrentLocationFav setLocation favContext />}
      </GorhomBottomSheet.BottomSheetView>
      <SearchScreen.SetLocationPinButton onPress=handleSetLocationPress />
    </>
  | None => React.null
  }
}
