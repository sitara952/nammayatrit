open ReactNative
open Tailwind
open Style
open SearchList

module Header = {
  @react.component
  let make = (~onBackPress) => {
    <View
      style={viewStyle(
        ~marginTop=0.->dp,
        ~height=20.->dp,
        ~paddingTop=30.->dp,
        ~paddingBottom=15.->dp,
        ~flexDirection=#row,
        ~justifyContent=#"space-between",
        ~alignItems=#center,
        ~width=100.->pct,
        (),
      )}>
      <TouchableOpacity
        style={viewStyle(
          ~height=26.->dp,
          ~alignItems=#center,
          ~borderRadius=13.,
          ~justifyContent=#center,
          ~backgroundColor=ThemebasedStyle.colorString.fillNeutralLow,
          ~width=36.->dp,
          (),
        )}
        onPress=onBackPress>
        <Svg.SvgXml xml={Close.svg("black")} />
      </TouchableOpacity>
    </View>
  }
}

module SetLocationPinButton = {
  @react.component
  let make = (~onPress=_ => ()) => {
    <Reanimated.ReanimatedView style={tw("mx-auto p-2 border-t border-borderNeutralMid w-full")}>
      <TouchableOpacity
        style={tw(
          "flex flex-row gap-2 justify-center items-center " ++ {
            Platform.os == #ios ? "mb-12px" : ""
          },
        )}
        onPress>
        <Svg.SvgXml xml=PurpleLocPin.svg />
        <Text> {React.string(GetLocale.getLocale(SET_PIN_ON_MAP).text)} </Text>
      </TouchableOpacity>
    </Reanimated.ReanimatedView>
  }
}

@react.component
let make = (
  ~handleExpandPress as _,
  ~activeIndex=1,
  ~sheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
  ~navigation: ReactNavigation.Core.navigation,
) => {
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)

  let (
    location: option<LocationTypes.location>,
    _,
    _,
    fetchLocationAndServiceability,
  ) = UseLocationDetails.useLocationDetails()

  let defaultInputVals: array<SearchTextInputs.searchInputType> = [
    {
      inputValue: SearchScreenHelper.constructInputVal(rideSearchData.source),
      focused: activeIndex === 0,
      location: rideSearchData.source,
      ref: React.useRef(Nullable.null),
      placeHolder: "Enter pickup location",
    },
    {
      inputValue: SearchScreenHelper.constructInputVal(rideSearchData.destination),
      focused: activeIndex === 1,
      location: rideSearchData.destination,
      ref: React.useRef(Nullable.null),
      placeHolder: "Enter drop location",
    },
  ]
  let (activeIndex, setActiveIndex) = React.useState(_ => 0)
  let (searchInputArray, setSearchInputArray) = React.useState(_ => defaultInputVals)

  let updateRideSearchContextState = (
    searchInputArray': array<SearchTextInputs.searchInputType>,
    index: int,
  ) => {
    searchInputArray'[index]->Utils.mapWithUnit(item => {
      item.location->Utils.mapWithUnit(location => {
        index == 0
          ? setRideSearchData({
              ...rideSearchData,
              source: Some(location),
            })
          : setRideSearchData({
              ...rideSearchData,
              destination: Some(location),
            })
      })
    })
  }

  let canNavigateToNextScreen = (searchInputArray': array<SearchTextInputs.searchInputType>) => {
    let navigateToNextScreen = searchInputArray'->Array.every(item => item.location->Option.isSome)
    if navigateToNextScreen {
      searchInputArray'[searchInputArray'->Array.length - 1]->Utils.mapWithUnit(dest => {
        dest.location->Utils.mapWithUnit(_ => {
          Keyboard.dismiss()
          setRideSearchData({
            ...rideSearchData,
            source: switch searchInputArray'[0] {
            | Some(item) => item.location
            | None => None
            },
            destination: switch searchInputArray'[searchInputArray'->Array.length - 1] {
            | Some(item) => item.location
            | None => None
            },
            searchId: None,
            gateId: None,
            destSet: true,
            isPickup: true,
            estimateId: None,
          })
          BottomSheetWrapper.collapseBottomSheet(sheetRef)
          rideSearchData.sourceSetUsingPin
            ? rideFlowAction(UpdateStage(RideFlowContext.ChooseYourRide))
            : rideFlowAction(UpdateStage(RideFlowContext.ConfirmPickup))
        })
      })
    }
  }

  let searchListClick = (index, location: option<LocationTypes.location>) => {
    location->Utils.mapWithUnit(location => {
      setSearchInputArray(prevArr => {
        let updatedSearchInputArray = prevArr->Array.mapWithIndex(
          (val, currIndex) => {
            if currIndex === index {
              let updatedVal: SearchTextInputs.searchInputType = {
                inputValue: SearchScreenHelper.constructInputVal(Some(location)),
                focused: false,
                location: Some(location),
                ref: val.ref,
                placeHolder: val.placeHolder,
              }
              location.tag === AUTOCOMPLETE ? rideFlowAction(AddToRecentSearches(location)) : ()
              updatedVal
            } else {
              switch val.ref.current {
              | Value(ref) => ref->TextInput.focus
              | _ => ()
              }
              let updatedVal: SearchTextInputs.searchInputType = {
                ...val,
                focused: true,
              }
              updatedVal
            }
          },
        )
        updateRideSearchContextState(updatedSearchInputArray, index)
        canNavigateToNextScreen(updatedSearchInputArray)
        updatedSearchInputArray
      })
    })
  }
  React.useEffect(_ => {
    if rideSearchData.source == None {
      setSearchInputArray(arr => {
        let newArr = arr->Array.mapWithIndex(
          (val, v2) => {
            if v2 == 0 {
              let updatedVal: SearchTextInputs.searchInputType = {
                inputValue: SearchScreenHelper.constructInputVal(rideFlowState.currentLocation),
                focused: false,
                location: rideFlowState.currentLocation,
                ref: val.ref,
                placeHolder: val.placeHolder,
              }
              updatedVal
            } else {
              val
            }
          },
        )
        canNavigateToNextScreen(newArr)
        newArr
      })
    }
    None
  }, [rideFlowState.currentLocation])

  React.useEffect1(() => {
    searchListClick(activeIndex, location)
    None
  }, [location])

  let savedLocationView = savedLoc => {
    switch savedLoc {
    | Some(savedLoc) =>
      <>
        <Space />
        <SavedLocationListView
          onPress={item => fetchLocationAndServiceability(item, activeIndex)}
          itemList=savedLoc
          navigation
        />
      </>
    | None => React.null
    }
  }

  // React.useLayoutEffect(() => {
  //   let timerId = Js.Global.setTimeout(() => handleExpandPress(), 100)
  //   Some(() => Js.Global.clearTimeout(timerId))
  // }, [])

  let onBackPress = () => {
    Keyboard.dismiss()
    setRideSearchData({...rideSearchData, isPickup: true, destSet: false, sourceSetUsingPin: false})
    rideFlowAction(UpdateStage(RideFlowContext.HomeScreen))
  }

  BackPress.hardwareBackPress(OnPress(onBackPress))

  <ScreenWrapperWithSafeArearViewAndPadding
    backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite paddingHorizontal={0.->dp}>
    <View style={tw("px-16px")}>
      <Header onBackPress={_ => onBackPress()} />
      <Space />
      <SearchTextInputs
        setSearchInputArray searchInputArray onFocus={index => setActiveIndex(_ => index)}
      />
      {savedLocationView(rideFlowState.savedLocation)}
      <Space />
    </View>
    <KeyboardAvoidingView
      behavior={Platform.os == #ios ? #padding : #height}
      enabled=true
      keyboardVerticalOffset={Platform.os == #ios ? -12. : 0.}
      style={tw("flex-1")}>
      <Reanimated.ReanimatedView style={tw("flex-1 px-16px")}>
        {searchInputArray
        ->Array.mapWithIndex((item, index) => {
          item.focused
            ? <SearchList
                key={index->Int.toString} index inputVal=item.inputValue onClick={searchListClick}
              />
            : React.null
        })
        ->React.array}
      </Reanimated.ReanimatedView>
      <SetLocationPinButton
        onPress={_ => {
          BottomSheetWrapper.collapseBottomSheet(sheetRef)
          rideFlowAction(UpdateStage(ConfirmPickup))
        }}
      />
    </KeyboardAvoidingView>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
