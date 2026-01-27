open Reanimated
open ReactNative
open Tailwind
open Style
open FavouriteFlowTypes

module FavouriteTagItem = {
  @react.component
  let make = (
    ~item: FavouriteFlowTypes.favouriteListType,
    ~index: int,
    ~isSelected: bool,
    ~tagExists: FavouriteFlowTypes.tagExists,
    ~curTag: favTag,
    ~setSelectedFavouriteTag: favTag => unit,
  ) => {
    let isDisabled = {
      switch item.favTag {
      | OTHERS => false
      | HOME => tagExists.home == true && curTag != HOME
      | WORK => tagExists.work == true && curTag != WORK
      }
    }
    <PressableComponent onPress={_ => setSelectedFavouriteTag(item.favTag)} disabled={isDisabled}>
      <ReanimatedView
        style={array([
          tw(
            "flex-row justify-center items-center h-9 px-4 rounded-full border-[1px] border-ctaPrimaryDisabled",
          ),
          isDisabled ? tw("bg-ctaSecondaryDisabled") : tw(""),
          index !== 0 ? tw("ml-2") : tw(""),
          isSelected ? tw("bg-fillNeutralBlack border-fillNeutralBlack") : tw(""),
        ])}>
        <ReanimatedView style={tw("pb-0.5")}>
          <IconWrapper
            size="h-4"
            icon={() => item.icon(~fill=isSelected ? "white" : ThemebasedStyle.colorString.textMid)}
          />
        </ReanimatedView>
        <TextWrapper
          overRideStyle={array([tw("pl-1"), isSelected ? tw("text-white") : tw("text-textBlack")])}
          text={CUSTOM_TEXT({text: item.title})}
          textType={Body_700}
        />
      </ReanimatedView>
    </PressableComponent>
  }
}

@react.component
let make = () => {
  let value = React.useContext(FavouriteContext.context)
  <FlatList
    showsHorizontalScrollIndicator={false}
    style={tw("mt-4")}
    contentContainerStyle={tw("")}
    horizontal=true
    data={SavedLocation.favouriteList}
    keyExtractor={(_, index) => Belt.Int.toString(index)}
    renderItem={renderItemProps =>
      switch value {
      | Some(val) =>
        <FavouriteTagItem
          index={renderItemProps.index}
          item={renderItemProps.item}
          isSelected={val.inputForm.variantTag == renderItemProps.item.favTag}
          tagExists=val.tagExists
          curTag=val.inputForm.variantTag
          setSelectedFavouriteTag={variantTag =>
            val.setInputForm(inputForm => {
              ...inputForm,
              variantTag,
              name: switch variantTag {
              | HOME => "Home"
              | WORK => "Work"
              | OTHERS => inputForm.name
              },
            })}
        />

      | None =>
        <FavouriteTagItem
          index={renderItemProps.index}
          item={renderItemProps.item}
          tagExists={
            home: true,
            work: true,
          }
          curTag=OTHERS
          isSelected={false}
          setSelectedFavouriteTag={_ => ()}
        />
      }}
  />
}
