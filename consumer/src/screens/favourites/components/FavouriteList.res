open ReactNative
open Reanimated
open Style
open Tailwind

@react.component
let make = (
  ~list: array<SavedLocationType.tagConfig>,
  ~sectionTitle: option<string>,
  ~variant: FavouriteFlowTypes.variant,
) => {
  let sectionHeader = switch sectionTitle {
  | Some(title) if title != "" =>
    <TextWrapper
      text={CUSTOM_TEXT({text: title})} textType=Body_800 overRideStyle={tw("pl-4 text-[#5F5B61]")}
    />
  | _ => React.null
  }

  let value = React.useContext(FavouriteContext.context)

  let transformedList = switch value {
  | Some(val) => SavedLocation.transformToFavorites(list, variant, val)
  | None => []
  }

  React.useEffect(() => {
    switch value {
    | Some(favContext) =>
      transformedList->Array.forEach(item =>
        switch item.savedLocTag {
        | FAV(val) =>
          switch val {
          | "Home" => favContext.setTagExists(tagExists => {...tagExists, home: true})
          | "Work" => favContext.setTagExists(tagExists => {...tagExists, work: true})
          | _ => ()
          }
        | ADD_HOME => favContext.setTagExists(tagExists => {...tagExists, home: false})
        | ADD_WORK => favContext.setTagExists(tagExists => {...tagExists, work: false})
        }
      )
    | None => ()
    }
    None
  }, [list])

  <ReanimatedView>
    {sectionHeader}
    <ReanimatedView style={tw("mt-4 px-4")}>
      <ReanimatedView
        style={array([
          tw("border-[1px] border-borderNeutralLow rounded-[14px] bg-white"),
          viewStyle(
            ~shadowColor="#00000040",
            ~shadowOffset=offset(~height=0.15, ~width=0.),
            ~shadowRadius=12.,
            ~shadowOpacity=0.15,
            ~elevation=2.,
            (),
          ),
        ])}>
        {switch transformedList->Array.length {
        | 0 =>
          <Text style={tw("p-5")}>
            {React.string(GetLocale.getLocale(NO_FAVOURITES_TO_SHOW_ADD_ONE_TO_CONTINUE).text)}
          </Text>
        | _ =>
          transformedList
          ->Array.mapWithIndex((locationItem, index) =>
            <ListItem
              key={locationItem.locationAddress ++ locationItem.locationTitle}
              index={index}
              listLength={transformedList->Array.length}
              item={locationItem}
            />
          )
          ->React.array
        }}
      </ReanimatedView>
    </ReanimatedView>
  </ReanimatedView>
}
