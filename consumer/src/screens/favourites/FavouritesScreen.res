open Reanimated
open ReactNative
open ReactNavigation
open Tailwind
open FavouritesScreenUtils
open FavouriteFlowTypes
open Style
open ReactQuery

@react.component(: Core.screenProps)
let make = (~navigation: ReactNavigation.Core.navigation, ~route: ReactNavigation.Core.route) => {
  let (addFavouriteFromSearch, setAddFavouriteFromSearch) = React.useState(_ => false) // check for adding fav from search input
  let (isEditFavourite, setIsEditFavourite) = React.useState(_ => false) // check whether editing or adding (new) fav
  let (searchTextInput, setSearchTextInput) = React.useState(_ => "")
  let (showOptions, setShowOptions) = React.useState(_ => false)
  let (index, setIndex) = React.useState(_ => -1.)
  let (showMap, setShowMap) = React.useState(_ => false)

  let (description, setDescription) = React.useState(_ => "")
  let (location, setLocation) = React.useState(_ => None) // location for adding from search autocomplete
  let (dropLocation, setDropLocation) = React.useState(_ => None) // drop location for oneClickRideFlow
  let (mapLocation, setMapLocation) = React.useState(_ => None) // drop location for mapLocation

  let (deleteTag, setDeleteTag) = React.useState(_ => "") // main tag for deleting
  let (inputForm, setInputForm) = React.useState(_ => {
    name: "",
    address: "",
    variantTag: OTHERS,
    placeId: None,
  })
  let (tagExists, setTagExists) = React.useState(_ => {
    // check whether the tags for home and work already exist
    home: true,
    work: true,
  })

  let addFavouriteBottomsheetRef = React.useRef(Nullable.null)

  let (getApiData, setGetApiData) = React.useState(_ => None)

  let transformDataFunc = data => {
    let transformData = switch data {
    | Some(Ok(savedReqLocationsListRes)) => SavedLocation.transformData(savedReqLocationsListRes)
    | Some(Error(exn)) =>
      Console.log2("Error: ", exn)
      []
    | None =>
      Console.log("No data available")
      []
    }
    setGetApiData(_ => Some(transformData))
  }

  let {data: savedLocData} = SavedLocationListGetRQ.useSavedLocationListGet(
    ~queryKey=SavedLocationListGetRQ.Keys.all,
  )
  let {mutate: deleteFavorite} = SavedLocationTagDeleteRQ.useSavedLocationTagDelete(
    ~mutationKey=SavedLocationTagDeleteRQ.Keys.all,
  )
  let {mutate: postFavorite} = SavedLocationPostRQ.useSavedLocationPost(
    ~mutationKey=SavedLocationPostRQ.Keys.all,
  )
  let {mutate: putFavorite} = SavedLocation.useUpdateSavedLocation(
    ~mutationKey=SavedLocationPostRQ.Keys.all,
  )

  let handleDeleteFav = () => {
    handleDeleteFav(
      deleteFavorite,
      deleteTag,
      setInputForm,
      setDeleteTag,
      setShowOptions,
      addFavouriteBottomsheetRef,
    )
  }
  React.useEffect(() => {
    transformDataFunc(savedLocData)
    Some(
      () => {
        setGetApiData(_ => None)
      },
    )
  }, [savedLocData])
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  let clearState = () => {
    setAddFavouriteFromSearch(_ => false)
    setIndex(_ => -1.)
    setIsEditFavourite(_ => false)
    setSearchTextInput(_ => "")
    setShowOptions(_ => false)
    setLocation(_ => None)
    setDescription(_ => "")
    setDropLocation(_ => None)
    setDeleteTag(_ => "")
    setInputForm(_ => {name: "", address: "", variantTag: OTHERS, placeId: None})
    setMapLocation(_ => None)
    setShowMap(_ => false)
    BottomSheetWrapper.closeBottomSheet(addFavouriteBottomsheetRef)
  }

  let isFocused = Native.useIsFocused()

  React.useEffect(() => {
    clearState() // clear states when moving out
    None
  }, [isFocused])

  let (
    savedLocationDestination,
    _,
    _,
    fetchLocationAndServiceability,
  ) = UseLocationDetails.useLocationDetails()

  let oneClickRideFlow = location => {
    fetchLocationAndServiceability(location, 1)
  }

  React.useEffect(() => {
    if Option.isSome(savedLocationDestination) {
      setRideSearchData({
        ...rideSearchData,
        source: rideFlowState.currentLocation,
        destination: savedLocationDestination,
        destSet: true,
        isPickup: true,
      })
      rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.ConfirmPickup))
    }
    None
  }, [savedLocationDestination])

  React.useEffect(() => {
    if Option.isNone(mapLocation) && Option.isSome(rideFlowState.currentLocation) {
      setMapLocation(_ => rideFlowState.currentLocation)
    }
    None
  }, [rideFlowState.currentLocation])

  let handleAddIconPress = (_: ReactNative.Event.pressEvent) => {
    setAddFavouriteFromSearch(_ => true)
    setMapLocation(_ => None)
    setSearchTextInput(_ => "")
    setIsEditFavourite(_ => false)
    setInputForm(_ => {name: "", address: "", variantTag: OTHERS, placeId: None})
    BottomSheetWrapper.expandBottomSheet(addFavouriteBottomsheetRef)
  }

  let handleBottomSheetClose = () => {
    setAddFavouriteFromSearch(_ => false)
    setSearchTextInput(_ => "")
    setDeleteTag(_ => "")
    setLocation(_ => None)
    setDropLocation(_ => None)
  }

  React.useEffect(() => {
    if isFocused {
      let action: option<action> = switch route.params {
      | Some(val) => Some(Core.Params.unsafeGetValue(val)["action"])
      | None => None
      }
      action->Utils.mapWithUnit(action => {
        switch action {
        | #add(HOME) =>
          setIndex(_ => 0.)
          setInputForm(
            favInputForm => {
              ...favInputForm,
              name: "Home",
              variantTag: HOME,
              address: GetLocale.getLocale(ADD_ADDRESS).text,
            },
          )
        | #add(WORK) =>
          setIndex(_ => 0.)
          setInputForm(
            favInputForm => {
              ...favInputForm,
              name: "Work",
              variantTag: WORK,
              address: GetLocale.getLocale(ADD_ADDRESS).text,
            },
          )
        | _ => ()
        }
      })
    }
    Some(
      () => {
        if !isFocused {
          setIndex(_ => -1.)
        }
      },
    )
  }, [isFocused])

  <FavouriteContext
    addFavouriteBottomsheetRef
    setDropLocation
    setAddFavouriteFromSearch
    setIsEditFavourite
    setShowOptions
    tagExists
    setTagExists
    setInputForm
    setSearchTextInput
    mapLocation
    setMapLocation
    setLocation
    description
    setDescription
    setDeleteTag
    inputForm
    showMap
    setShowMap>
    <AddFavouriteFromMap setLocation showMap />
    <ReanimatedView style={array([tw("flex-1 bg-white "), showMap ? tw("hidden") : tw("")])}>
      <SafeAreaView />
      <ReanimatedView
        style={tw(
          "flex flex-row items-center justify-between px-5 h-11 border-b-[1px] border-borderNeutralLow",
        )}>
        <PressableComponent
          onPress=onBackPress hitSlop={{bottom: 10., top: 10., left: 10., right: 10.}}>
          <IconWrapper icon={() => <ArrowLeft />} size="h-6" />
        </PressableComponent>
        <TextWrapper text={FAVOURITES} textType={Head_700} />
        <PressableComponent
          onPress={handleAddIconPress} hitSlop={{bottom: 10., top: 10., left: 10., right: 10.}}>
          <IconWrapper
            icon={() => <AddIcon fill=ThemebasedStyle.colorString.fillPrimaryHigh />} size="h-6"
          />
        </PressableComponent>
      </ReanimatedView>
      {switch getApiData {
      | Some(transformedSavedLoc) =>
        <ReactNative.ScrollView style={tw("mb-4")}>
          <ReanimatedView style={tw("pt-4")}>
            <FavouriteList sectionTitle={None} list={transformedSavedLoc} variant=DEFAULT />
          </ReanimatedView>
          <ReanimatedView style={tw("pt-8")}>
            <FavouriteList
              sectionTitle={Some(GetLocale.getLocale(OTHER_FAVOURITES).text)}
              list={transformedSavedLoc}
              variant=FAVORITES
            />
          </ReanimatedView>
        </ReactNative.ScrollView>
      | None => React.null
      }}
      <GorhomBottomSheet.BottomSheet
        onClose={handleBottomSheetClose}
        topInset={34.}
        enablePanDownToClose=true
        android_keyboardInputMode={addFavouriteFromSearch ? "adjustResize" : "adjustPan"}
        animateOnMount=true
        index={index}
        ref={addFavouriteBottomsheetRef->ReactNative.Ref.value}
        snapPoints=[showOptions ? "34%" : "46%", "90%"]>
        {addFavouriteFromSearch
          ? <AddFavouriteFromSearch searchTextInput setLocation />
          : showOptions
          ? <ShowFavouriteOptions
            navigation dropLocation oneClickRideFlow setShowOptions handleDeleteFav
          />
          : <AddEditFavInputForm
              isEditFavourite putFavorite deleteTag postFavorite location clearState
            />}
      </GorhomBottomSheet.BottomSheet>
    </ReanimatedView>
  </FavouriteContext>
}
