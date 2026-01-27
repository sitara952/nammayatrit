open ReactNavigation
open ReactNative
open Style
open Tailwind
open! Reanimated

module DeleteAccount = {
  @react.component
  let make = () => {
    let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)
    <Pressable
      onPress={_ =>
        setModal({
          ...modal,
          modalComponent: Some(<DeleteAccountPopUp.DeleteAccountPopup />),
          backgroundClick: () => closeModal(),
        })}>
      {interactionState => {
        <ReanimatedView
          style={array([
            tw("px-3.5 pb-4 "),
            interactionState.pressed ? tw("bg-ctaSecondaryActive") : tw(""),
          ])}>
          <View style={tw("h-[1px] bg-borderNeutralLow mb-4 ")} />
          <View style={tw(` flex-row`)}>
            <View style={tw(` flex-row justify-start items-center w-[90%]`)}>
              <Svg.SvgXml xml=DeleteIcon.svg width={"22"} height={"22"} />
              <View style={tw(" ml-3.5")}>
                <TextWrapper textType={Body_600} text={CUSTOM_TEXT({text: "Delete Account"})} />
              </View>
            </View>
            <Svg.SvgXml xml=ChevronRight.svgSharp />
          </View>
        </ReanimatedView>
      }}
    </Pressable>
  }
}

module Topic = {
  @react.component
  let make = (~navigation, ~index, ~item: HelpAndSupportApi.issueCategoryRes, ~setDoAPICall) => {
    let logoUrl = String.split(item.logoUrl, ",")

    let url = switch logoUrl[1] {
    | Some(val) => val
    | None => " "
    }

    <Pressable
      onPress={_ => {
        Core.Navigation.navigateWithParams(
          navigation,
          AppRoutes.navigationRouts.reportIssueScreen,
          {
            "data": item,
          },
        )

        setDoAPICall(_ => false)
      }}>
      {interactionState => {
        <ReanimatedView
          style={array([
            tw("px-3.5 pb-4 "),
            interactionState.pressed ? tw("bg-ctaSecondaryActive") : tw(""),
          ])}>
          {index != 0 ? <View style={tw("h-[1px] bg-borderNeutralLow mb-4 ")} /> : React.null}
          <View style={tw(`${index == 0 ? "pt-4" : ""} flex-row`)}>
            <View style={tw(` flex-row justify-start items-center w-[90%]`)}>
              <Image
                source={Image.Source.fromUriSource({uri: url})}
                style={array([
                  imageStyle(~width=8.->pct, ~height=100.->pct, ~resizeMode=#contain, ()),
                ])}
              />
              <View style={tw("ml-3")}>
                <TextWrapper textType={Body_600} text={CUSTOM_TEXT({text: item.category})} />
              </View>
            </View>
            <Svg.SvgXml xml=ChevronRight.svgSharp />
          </View>
        </ReanimatedView>
      }}
    </Pressable>
  }
}

module AllTopics = {
  @react.component
  let make = (~navigation, ~categoryList, ~setDoAPICall) => {
    <ReanimatedView style={tw(" ")}>
      <View style={tw(" mb-3")}>
        <TextWrapper textType={Body_700} text={ALL_TOPICS} />
      </View>
      <ReanimatedView style={tw(" border-[2px] rounded-2xl border-borderNeutralLow")}>
        <View>
          {categoryList
          ->Array.mapWithIndex((categoryItem, index) => {
            <Topic key={Int.toString(index)} navigation index item=categoryItem setDoAPICall />
          })
          ->React.array}
          <DeleteAccount />
        </View>
      </ReanimatedView>
    </ReanimatedView>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (recentRide, setRecentRide) = React.useState(() => None)
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)

  let (categoryList, setCategoryList) = React.useState(_ => [])
  let (doAPICall, setDoAPICall) = React.useState(_ => true)
  let isFocused = Native.useIsFocused()

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  let helpSupportAPI = async () =>
    await ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.issueCategory,
      ~onSuccess=resp => {
        Console.log(resp)
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let categoriesListRes = HelpAndSupportApi.decodeToIssueCategoryListResType(obj)
            switch categoriesListRes {
            | Some(val) => setCategoryList(_ => val.categories)
            | None => ()
            }
          }
        | None => Console.log("No JSON Object Found")
        }
      },
      ~onError=_ => {
        Console.warn("API ERROR")
      },
    )

  let recentRideDetail = () => {
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.rideBookingList("1", "0", "false", None, None),
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let rideList = RideBookingList.itemToObjectMapper(obj)
            let transformedRideList =
              rideList.list->Array.map(MyRidesScreenType.transformRideBooking)

            let recentRideData = switch transformedRideList[0] {
            | Some(rideData) => rideData

            | None => None
            }
            setRecentRide(_ => recentRideData)
            Console.log2("Log debug", recentRideData)
          }
        | None => ()
        }
      },
      ~onError=_ => {
        Console.warn("API ERROR")
      },
    )->ignore
  }

  let goToRideDetail = rideDetail => {
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.myRideDetails,
      {
        "data": rideDetail,
      },
    )
  }

  React.useEffect1(() => {
    doAPICall && isFocused
      ? {
          helpSupportAPI()->ignore
          recentRideDetail()->ignore
        }
      : ()
    None
  }, [isFocused])

  let {headerBgColor} = ThemebasedStyle.useThemeBasedStyle()

  <ScreenWrapperWithSafeArearViewAndPadding
    paddingHorizontal={0.->dp} backgroundColor=headerBgColor>
    <HeaderWithSafeArea title={HELP_AND_SUPPORT} onBackPress />
    <ReanimatedView style={tw("flex-1 bg-fillNeutralWhite ")}>
      <ScrollView showsVerticalScrollIndicator=false>
        <View style={tw("mx-4 my-5 flex-1")}>
          <View style={tw("flex-row justify-between mb-3.5")}>
            <TextWrapper
              text={YOUR_RECENT_RIDE} textType={Body_700} color=ThemebasedStyle.colorClass.textBlack
            />
            <PressableComponent
              onPress={_ => {
                Core.Navigation.navigateWithParams(
                  navigation,
                  AppRoutes.navigationRouts.myRidesScreenNavigation,
                  {
                    "navigateFromHS": true,
                  },
                )
              }}>
              <TextWrapper
                text={VIEW_ALL_RIDES}
                textType={Body_600}
                color=ThemebasedStyle.colorClass.textPrimary
              />
            </PressableComponent>
          </View>
          <View style={tw(" mb-8 flex-1")}>
            {switch recentRide {
            | Some(data) =>
              <PressableComponent onPress={_ => goToRideDetail(data)}>
                <View
                  style={tw("p-16px border border-borderNeutralLow rounded-2xl gap-16px flex-col")}>
                  <MyRideDetails.FromToMap
                    isRideCancelled=false
                    source=data.sourceLocationInfo
                    destination=data.destinationLocationInfo
                    rideStartTimeInfo=data.rideStartTime
                    rideEndTimeInfo=data.rideEndTime
                  />
                  <View>
                    <View style={tw("h-[1px] bg-borderNeutralLow mb-4 ")} />
                    <View style={tw(" flex-row justify-between items-center")}>
                      <TextWrapper
                        text={REPORT_AN_ISSUE_WITH_THIS_RIDE}
                        textType={SBody_600}
                        color=ThemebasedStyle.colorClass.textPrimary
                      />
                      <Svg.SvgXml xml=ChevronRight.svgSharp />
                    </View>
                  </View>
                </View>
              </PressableComponent>
            | None => React.null
            }}
          </View>
          <AllTopics navigation categoryList setDoAPICall />
        </View>
      </ScrollView>
    </ReanimatedView>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
