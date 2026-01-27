open ReactNative
open Style
open LocaleStringType
open ReactQuery
@react.component
let make = (
  ~sheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
  ~setInitialIndex,
  ~navigation: ReactNavigation.Core.navigation,
) => {
  let {data: transformedSavedLoc} = useQuery({
    queryKey: SavedLocationListGetRQ.Keys.all,
    queryFn: _ => SavedLocationListGet.savedLocationListGetApiCall(),
  })
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let (rideFlowState, rideFlowAction) = React.useContext(RideFlowContext.context)
  let (bannerData, setBannerData) = React.useState(_ => [])
  let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
  FindingRidesHelper.clearPollingTime()->ignore

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

  React.useEffect(() => {
    transformDataFunc(transformedSavedLoc)
    Some(
      () => {
        setGetApiData(_ => None)
      },
    )
  }, [transformedSavedLoc])

  let openSearchScreen = () => {
    setInitialIndex(_ => 0.)
    setRideSearchData({
      ...rideSearchData,
      source: rideFlowState.currentLocation,
      destination: None,
    })
    rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.Search(1)))
  }

  let styles = {
    "recent_searches_container": viewStyle(
      ~flexDirection=#column,
      ~borderRadius=14.0,
      ~borderColor=ThemebasedStyle.colorString.borderNeutralLow,
      ~borderWidth=2.0,
      ~paddingHorizontal=16.->dp,
      ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
      (),
    ),
  }

  let oneClickRideFlow = location => {
    setInitialIndex(_ => 0.)
    setRideSearchData({
      ...rideSearchData,
      source: rideFlowState.currentLocation,
      destSet: true,
      isPickup: true,
      destination: Some(location),
    })
    BottomSheetWrapper.collapseBottomSheet(sheetRef)
    rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.ConfirmPickup))
  }

  let arrowView = location =>
    <PressableComponent onPress={_ => oneClickRideFlow(location)}>
      <View
        style={viewStyle(
          ~width=36.->dp,
          ~height=24.->dp,
          ~borderRadius=12.,
          ~borderColor=ThemebasedStyle.colorString.iconPrimary,
          ~borderWidth=1.3,
          ~alignItems=#center,
          ~justifyContent=#center,
          (),
        )}>
        <Svg.SvgXml xml={RightArrow.svg} />
      </View>
    </PressableComponent>

  let renderSearchListView = (index, item: LocationTypes.location, recentSearches) => {
    <SearchListItem
      onPress={location => oneClickRideFlow(location)}
      location=Some(item)
      heading=item.title
      subHeading=item.subtitle
      feedbackDisabled=true
      postfixViewType={CustomIcon(arrowView(item))}
      postfixViewAlignment=#center
      backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite
      borderColor=ThemebasedStyle.colorString.borderNeutralLow
      paddingHorizontal={2.->dp}
      borderConfig={
        top: 0.,
        bottom: index == Array.length(recentSearches) - 1 ? 0. : 1.,
        left: 0.,
        right: 0.,
      }
    />
  }

  React.useEffect(() => {
    rideFlowAction(UpdatedSavedLocation(Option.getOr(getApiData, [])))
    None
  }, [transformedSavedLoc])

  <ScreenWrapperWithSafeArearViewAndPadding
    backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite>
    <View style={viewStyle(~top=10.->dp, ~left=16.->dp, ~right=16.->dp, ~position=#absolute, ())}>
      <TextWrapper
        text=CUSTOM_TEXT({
          text: "Hiya, " ++
          userProfile.firstName->Option.getOr("User") ++
          userProfile.lastName->Option.map(lastName => " " ++ lastName)->Option.getOr(""),
        })
        textType={Title_800}
        overRideStyle={textStyle(
          ~textAlign=#left,
          ~color=ThemebasedStyle.colorString.textBlack,
          (),
        )}
      />
      <Space />
      <TouchableTextWithIcon
        text={GetLocale.getLocale(WHERE_ARE_YOU_GOING).text}
        flexWrap={#nowrap}
        icon=Some(Search.svg)
        iconSize="20"
        borderRadius=10.
        gapWidth=12.
        textType={SHead_600}
        paddingVertical={11.->dp}
        onPress={_ => openSearchScreen()}
        componentType=CustomTagIcon({
          strokeColor: "#8519FC",
          backgroundColor: "#FCFCFD",
          color: "#2E2C2F",
        })
        shadowIntensity=1.
      />
      <Space height=16. />
      <BannerCarousel bannerList=Banner(bannerData) showDotIndicator=true />
      <Space height=16. />
      {switch rideFlowState.recentSearches {
      | Some(recentSearches) =>
        <>
          <TextWrapper
            text={RECENT}
            textType={Body_600}
            marginLeft={4.->dp}
            overRideStyle={textStyle(
              ~color=ThemebasedStyle.colorString.textHigh,
              ~textAlign=#left,
              (),
            )}
          />
          <Space height=16. />
          <View style={styles["recent_searches_container"]}>
            <FlatList
              scrollEnabled=false
              data={Array.slice(recentSearches, ~start=0, ~end=2)}
              horizontal=false
              keyExtractor={(_, i) => i->Int.toString}
              renderItem={({index, item}) =>
                renderSearchListView(index, item, Array.slice(recentSearches, ~start=0, ~end=2))}
            />
          </View>
          <Space />
        </>
      | None => React.null
      }}
      <TextWrapper
        text={FAVOURITES}
        textType={Body_700}
        overRideStyle={textStyle(~color=ThemebasedStyle.colorString.textHigh, ~textAlign=#left, ())}
      />
      <Space height=6. />
      {switch getApiData {
      | Some(savedLocations) =>
        <SavedLocationListView
          onPress={location => oneClickRideFlow(location)} itemList={savedLocations} navigation
        />
      | None => React.null
      }}
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
