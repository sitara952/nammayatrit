open Reanimated
open Tailwind
open! ReactNative
open Style
open ReactNavigation
open TypeScriptModules
open ConfigManager
open MMKV

let segmentWidth = ReactNative.Dimensions.get(#screen).width *. 0.85 -. 40. -. 20.
let drawerWidth = ReactNative.Dimensions.get(#screen).width *. 0.85

type listOption = {
  title: LocaleStringType.localeString,
  icon: React.component<unit>,
  handlePress: Event.pressEvent => unit,
}

module Safety = {
  @react.component
  let make = (~navigation) => {
    <PressableComponent
      onPress={_ => {
        Core.Navigation.navigateWithParams(
          navigation,
          AppRoutes.navigationRouts.safetyScreen,
          {"screen": AppRoutes.navigationRouts.safetySetup},
        )
      }}
      style={array([
        tw("flex items-center justify-center bg-fillNeutralWhite"),
        tw(`w-[${Belt.Float.toString(segmentWidth /. 3.)}px] h-[72px] rounded-[14px]`),
      ])}>
      <SafetyIcon />
      <AnimatedText style={tw("pt-[12px] text-[14px] font-bold text-textBlack")}>
        {React.string("Safety")}
      </AnimatedText>
    </PressableComponent>
  }
}

module MyRides = {
  @react.component
  let make = (~navigation) => {
    <ReanimatedView style={tw("mx-2.5")}>
      <PressableComponent
        onPress={_ => {
          Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.myRidesScreenNavigation)
        }}
        style={array([
          tw("flex items-center justify-center bg-fillNeutralWhite"),
          tw(`w-[${Belt.Float.toString(segmentWidth /. 3.)}px] h-[72px] rounded-[14px]`),
        ])}>
        <MyRidesIcon />
        <AnimatedText style={tw("pt-[12px] text-[14px] font-bold text-textBlack")}>
          <TextWrapper text={Bookings} textType=Body_700 />
        </AnimatedText>
      </PressableComponent>
    </ReanimatedView>
  }
}

module Invite = {
  @react.component
  let make = (~navigation) => {
    <PressableComponent
      onPress={_ => Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.referralScreen)}
      style={array([
        tw("flex items-center justify-center bg-fillNeutralWhite"),
        tw(`w-[${Belt.Float.toString(segmentWidth /. 3.)}px] h-[72px] rounded-[14px]`),
      ])}>
      <InviteFriendIcon />
      <AnimatedText style={tw("pt-[12px] text-[14px] font-bold text-textBlack")}>
        {React.string("Invite")}
      </AnimatedText>
    </PressableComponent>
  }
}

module Header = {
  @react.component
  let make = (~navigation, ~userName) => {
    let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
    let (count, setCount) = React.useState(_ => 0)

    <SafeAreaView style={array([tw("bg-yellowPositive")])}>
      <Pressable
        onPress={_ => {
          Console.log2("pressed", count)
          if count > 3 {
            setCount(_ => 0)
            Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.chooseTheme)
            let _ = setTimeout(() => {
              setCount(_ => 0)
            }, 10000)
          } else {
            setCount(s => s + 1)
          }
        }}>
        {_ =>
          <ReanimatedView style={array([tw("px-5 pt-3 pb-5")])}>
            <ReanimatedView
              style={tw("h-11 w-[52px] rounded-[22px] bg-iconLow justify-center  items-center")}>
              <Pressable
                onPress={_ =>
                  Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.myProfile)}>
                {_interactionState =>
                  <IconWrapper icon={() => <UserIconSvg fill="white" />} size="h-6" />}
              </Pressable>
            </ReanimatedView>
            <AnimatedText style={tw("text-[22px] font-bold pt-[11px]")}>
              {React.string(userName)}
            </AnimatedText>
            <Animated.Text style={tw("text-[13px] font-semibold text-textHigh pt-[5px]")}>
              {React.string(userProfile.maskedMobileNumber->Option.getOr(""))}
            </Animated.Text>
          </ReanimatedView>}
      </Pressable>
      <ReanimatedView style={tw("flex flex-row justify-between items-center mx-5 pb-5")}>
        <Safety navigation />
        <MyRides navigation />
        <Invite navigation />
      </ReanimatedView>
    </SafeAreaView>
  }
}

module SideBarCell = {
  @react.component
  let make = (~listItem: listOption) => {
    <Pressable onPress={listItem.handlePress} style={_interactionState => tw("px-2.5")}>
      {interactionState => {
        <ReanimatedView
          style={array([
            tw("flex flex-row items-center py-[14px] px-2.5 rounded-[14px]"),
            interactionState.pressed ? tw("bg-ctaSecondaryActive") : tw(""),
          ])}>
          <IconWrapper size="h-5" icon={listItem.icon} />
          <AnimatedText style={tw("text-base font-semibold pl-2")}>
            <TextWrapper text=listItem.title textType=Body_700 />
          </AnimatedText>
        </ReanimatedView>
      }}
    </Pressable>
  }
}

module SideBarList = {
  @react.component
  let make = (~list: array<listOption>) => {
    <ReanimatedView style={tw("py-2.5")}>
      {list
      ->Array.mapWithIndex((listItem, index) => {
        <SideBarCell key={Int.toString(index)} listItem />
      })
      ->React.array}
    </ReanimatedView>
  }
}

let mmkv = MMKV.createMMKV()

@react.component
let make = (~state as _, ~navigation, ~descriptors as _, ~userName="", ~routeName="homeScreen") => {
  let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)

  let isDrawerOpen = ReactNavigation.Drawer.useDrawerStatus()

  let isFavouriteEnabled = React.useMemo1(() => {
    if isDrawerOpen == #"open" {
      let featureFlags =
        ConfigManager.getString("feature_flags")
        ->JSON.parseExn
        ->Utils.getDictFromJson

      let getFeatureFlag = featureFlags => {
        featureFlags
        ->Utils.getDictFromJsonObject
        ->Dict.get("favouriteDriver")
        ->Option.mapOr(true, x => {
          Console.log2("feature flag", x)
          Utils.getBoolFromJson(x, true)
        })
      }

      let getFavoritesEnabled = (trackingMode: string) => {
        featureFlags->Dict.get(trackingMode)->Option.mapOr(true, getFeatureFlag)
      }

      let city = MMKV.getString(mmkv, "USER_CITY_KEY")->Option.getOr("default")
      let isFavouriteEnabled =
        ConfigManager.getString("tracking_mode")
        ->JSON.parseExn
        ->Utils.getDictFromJson
        ->Dict.get(city)
        ->Option.mapOr("default", x => {
          x->Utils.getStringFromJson("default")
        })
        ->getFavoritesEnabled
      isFavouriteEnabled
    } else {
      false
    }
  }, [isDrawerOpen])

  let sideDrawerPrimaryOptionsBase: array<listOption> = [
    {
      title: APP_LANGUAGE,
      icon: () => <AppLanguage />,
      handlePress: _ =>
        ReactNavigation.Core.Navigation.navigate(
          navigation,
          AppRoutes.navigationRouts.appLanguageNavigation,
        ),
    },
    {
      title: HELP_AND_SUPPORT,
      icon: () => <SupportIcon />,
      handlePress: _ =>
        Core.Navigation.navigate(
          navigation,
          AppRoutes.navigationRouts.helpAndSupportScreenNavigation,
        ),
    },
  ]

  let sideDrawerPrimaryOptions = {
    if isFavouriteEnabled {
      sideDrawerPrimaryOptionsBase->Array.concat([
        {
          title: FAVOURITES,
          icon: () => <FavoritesIcon />,
          handlePress: _ =>
            ReactNavigation.Core.Navigation.navigate(
              navigation,
              AppRoutes.navigationRouts.favouritesScreen,
            ),
        },
      ])
    } else {
      sideDrawerPrimaryOptionsBase
    }
  }
  let sideDrawerSecondaryOptions: array<listOption> = [
    {
      title: ABOUT,
      icon: () => <AboutIcon />,
      handlePress: _ => Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.aboutScreen),
    },
    {
      title: LOGOUT,
      icon: () => <LogoutIcon />,
      handlePress: _ => {
        setModal({
          ...modal,
          modalComponent: Some(<TypeScriptModules.LogOutModal closeModal />),
          backgroundClick: () => closeModal(),
        })
      },
    },
  ]

  <ReanimatedView style={tw("flex-1 bg-fillNeutralWhite relative overflow-hidden")}>
    <Header navigation userName />
    <ReanimatedView
      // showsVerticalScrollIndicator=false
      style={tw(`pb-[${Belt.Float.toString(drawerWidth /. 1.8475609756)}px]`)}>
      <SideBarList list={sideDrawerPrimaryOptions} />
      // TODO: Should be changed into a Linear Gradient Component
      <ReanimatedView style={tw("h-[1px] mx-5 bg-borderNeutralMid rounded-[14px]")} />
      <SideBarList list={sideDrawerSecondaryOptions} />
    </ReanimatedView>
    {if routeName != "homeTypeScript" {
      <ReanimatedView
        style={array([tw("absolute bottom-0 overflow-hidden w-full pb-6 underline-offset-auto")])}>
        <View
          style={viewStyle(
            ~flexDirection=#row,
            ~width=100.->pct,
            ~alignItems=#center,
            ~justifyContent=#center,
            (),
          )}>
          <TouchableOpacity
            onPress={_ =>
              ReactNavigation.Core.Navigation.navigate(
                navigation,
                AppRoutes.navigationRouts.homeTypeScript,
              )}
            style={viewStyle(~padding=14.->dp, ())}>
            <View style={array([tw("flex flex-row")])}>
              <View>
                <IconButton height={20.->dp} width={20.->dp} icon={LeftArrow.svg} />
              </View>
              <View style={array([tw("flex flex-col")])}>
                <TextWrapper text={BACK_TO_HOME} textType=Body_700 />
                <View
                  style={viewStyle(
                    ~backgroundColor="#14171F",
                    ~width=100.->pct,
                    ~height=2.->dp,
                    (),
                  )}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ReanimatedView>
    } else {
      React.null
    }}
  </ReanimatedView>
}

let sideDrawer = make
