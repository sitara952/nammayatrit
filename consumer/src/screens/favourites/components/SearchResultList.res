open Reanimated
open ReactNative
open Style
open Tailwind

type searchResultItem = {
  iconColor: string,
  title: string,
  address: string,
  distance: string,
}

let itemWidth = Dimensions.get(#screen).width -. 62.

module SearchListItem = {
  @react.component
  let make = (~index: int, ~listLength: int, ~item: AutoComplete.autoCompleteItem) => {
    let value = React.useContext(FavouriteContext.context)

    let handleSearchListItemPress = (_: ReactNative.Event.pressEvent) => {
      switch value {
      | Some(value) =>
        ReactNative.Keyboard.dismiss()
        value.setAddFavouriteFromSearch(_ => false)
        value.setShowOptions(_ => false)
        switch item.locationData {
        | Some(loc) =>
          value.setDescription(_ => LocationUtils.getTitleSubtitle(loc))
          value.setSearchTextInput(_ => LocationUtils.getTitleSubtitle(loc))
          value.setMapLocation(_ => Some(loc))
          value.setInputForm(inputForm => {
            ...inputForm,
            address: Option.getOr(loc.title, "") ++ ", " ++ Option.getOr(loc.subtitle, ""),
            placeId: loc.placeId,
          })
        | None => ()
        }
        BottomSheetWrapper.collapseBottomSheet(value.addFavouriteBottomsheetRef)
      | None => ()
      }
    }

    <Pressable onPress=handleSearchListItemPress>
      {_ => {
        <ReanimatedView
          style={array([
            tw("py-4"),
            index !== listLength - 1 ? tw("border-b-[1px] border-ctaSecondaryActive") : tw(""),
          ])}>
          <ReanimatedView style={tw("flex flex-row items-start")}>
            <IconWrapper size="h-5" icon={() => <WorkIcon />} />
            <ReanimatedView style={tw("pl-2.5")}>
              <ReanimatedView
                style={array([
                  tw("flex flex-row justify-between items-center"),
                  tw(`w-[${Belt.Float.toString(itemWidth)}px]`),
                ])}>
                {switch item.locationData {
                | Some(locationData) =>
                  <TextWrapper
                    text={CUSTOM_TEXT({text: Option.getOr(locationData.title, "")})}
                    textType={Body_400}
                    overRideStyle={tw("text-[15px] font-extrabold text-textBlack w-4/5")}
                  />
                | None => React.null
                }}
                <TextWrapper
                  textType={Body_400}
                  text={CUSTOM_TEXT({text: item.postfixText})}
                  overRideStyle={tw("text-[12px] font-bold text-textHigh w-1/5 text-right")}
                />
              </ReanimatedView>
              {switch item.locationData {
              | Some(locationData) =>
                <TextWrapper
                  textType={Body_400}
                  text={CUSTOM_TEXT({text: Option.getOr(locationData.subtitle, "")})}
                  overRideStyle={tw("text-[12px] font-bold pt-1.5 text-textHigh max-w-11/12")}
                />
              | None => React.null
              }}
            </ReanimatedView>
          </ReanimatedView>
        </ReanimatedView>
      }}
    </Pressable>
  }
}

@react.component
let make = (~searchTextInput: string) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let inputVal = Utils.useDebounce(Constants.debounce_delay, searchTextInput)
  let {mutate, data: autoCompletePredictions} = AutoComplete.useMapsAutoCompletePost(
    ~mutationKey=MapsAutoCompletePostRQ.Keys.all,
  )
  let constructBodyAndCallApi = async () => {
    let body = await AutoComplete.mkAutoCompleteReq(
      ~input=inputVal,
      ~currentLocation=rideFlowState.currentLocation,
    )
    mutate(body, None)
  }

  React.useEffect1(() => {
    if String.length(inputVal) >= 3 {
      constructBodyAndCallApi()->ignore
    }
    None
  }, [inputVal])

  switch autoCompletePredictions {
  | Some(_) =>
    <FlatList
      style={tw("mt-2.5 px-4")}
      showsVerticalScrollIndicator=false
      data={AutoComplete.constructSearchListData(
        ~predictionList=AutoComplete.transformApiData(~data=autoCompletePredictions),
      )}
      horizontal=false
      keyboardShouldPersistTaps={#handled}
      keyExtractor={(_, index) => Belt.Int.toString(index)}
      renderItem={({item, index}) =>
        <SearchListItem
          key={Js.Int.toString(index)}
          item
          index
          listLength={AutoComplete.constructSearchListData(
            ~predictionList=AutoComplete.transformApiData(~data=autoCompletePredictions),
          )->Array.length}
        />}
    />
  | None => React.null
  }
}
