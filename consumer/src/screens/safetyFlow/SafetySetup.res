open ReactNavigation
open ReactNative
open Tailwind

type safetySetupOptions = {
  action: unit => unit,
  icon: ReactNative.Image.Source.t,
  primaryText: LocaleStringType.localeString,
  secondaryText: option<LocaleStringType.localeString>,
  setupComplete: bool,
}

let bannerWithTextData: array<BannerCarousel.bannerWithTextData> = [
  {
    heading: "Trusted Contacts",
    subHeading: "Trusted contacts can follow your ride, chat on the app & support you in emergencies",
    image: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/safetyCarousel/ic_trusted_contact.png"),
    ),
  },
  {
    heading: "Ride Verification",
    subHeading: "Verify every ride with a ride PIN to ensure you get connected with the right driver",
    image: Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/safetyCarousel/ic_trusted_contact.png"),
    ),
  },
]

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (safetyContext, setSafetyContext) = React.useContext(SafetyFlowContext.safetyContext)

  let safetySetupView = (item, index) => {
    let setupCompleteIcon = Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/ic_green_tick.png"),
    )
    <PressableComponent
      style={tw(`flex-col rounded-2xl bg-fillInfoHigh my-2`)}
      onPress={_ => item.action()}
      key={string_of_int(index) ++ "safetySetupView"}>
      <View style={tw(`flex-col rounded-2xl border-[1px] border-ctaSecondaryPressed bg-white`)}>
        <View style={tw(`flex-row px-3 py-3 justify-between`)}>
          <View style={tw(`flex-row gap-3`)}>
            <View style={tw(`px-2 py-2 rounded-full bg-fillNeutralLow`)}>
              <Image source=item.icon style={tw(`h-5 w-5`)} />
              {switch item.setupComplete {
              | true =>
                <Image
                  source=setupCompleteIcon style={tw(`-top-0.5 -right-0.5 h-4 w-4 absolute`)}
                />
              | false => React.null
              }}
            </View>
            <TextWrapper
              color=ThemebasedStyle.colorClass.textBlack
              textType={Body_600}
              text=item.primaryText
              overRideStyle={tw(`self-center`)}
            />
          </View>
          <View style={tw(`self-center`)}>
            <Svg.SvgXml xml=ChevronRight.svgSharp width={"25"} height={"25"} />
          </View>
        </View>
      </View>
      {switch item.secondaryText {
      | Some(secondaryText) =>
        <View style={tw(`flex-row p-1 pl-3`)}>
          <TextWrapper
            color=ThemebasedStyle.colorClass.textWhite
            textType={SBody_600}
            text=secondaryText
            overRideStyle={tw(`self-center`)}
          />
        </View>
      | None => React.null
      }}
    </PressableComponent>
  }

  let getEmergencySettings = () => {
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.getEmergencySettings,
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let emergencySettingResp = EmergencySettings.decodeEmergencySettingsReq(obj)
            setSafetyContext(emergencySettingResp)
          }
        | None => ()
        }
      },
      ~onError=_ => {
        Console.warn("getEmergencySettings API ERROR")
      },
    )->ignore
  }

  let safetySetupOptions = React.useCallback((): array<safetySetupOptions> => {
    [
      {
        action: () => {
          Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.trustedContacts)
        },
        icon: Image.Source.fromRequired(
          Packager.require("../../resources/assets/png/ic_contact.png"),
        ),
        primaryText: TRUSTED_CONTACTS,
        secondaryText: Some(ENABLE_LIVE_TRACKING_AND_IN_APP_CHAT),
        setupComplete: switch safetyContext {
        | Some(emergencySetting) =>
          emergencySetting.defaultEmergencyNumbers->Array.length > 0 ? true : false
        | None => false
        },
      },
      {
        action: () => {
          Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideVerification)
        },
        icon: Image.Source.fromRequired(Packager.require("../../resources/assets/png/ic_lock.png")),
        primaryText: RIDE_VERIFICATION,
        secondaryText: None,
        setupComplete: false,
      },
    ]
  }, [safetyContext])

  let completedSafetySetups = React.useCallback((): int => {
    safetySetupOptions()->Array.filter(item => item.setupComplete)->Array.length
  }, [safetySetupOptions])

  React.useEffect(() => {
    getEmergencySettings()->ignore
    None
  }, [])

  <View style={tw(`h-full w-full bg-white`)}>
    <HeaderWithSafeArea
      title=SAFETY
      onBackPress={_ => {
        navigation->Core.Navigation.goBack()
      }}
      backgroundColor="bg-fillPrimaryLow"
    />
    <View style={tw(`h-55 mt-5`)}>
      <BannerCarousel bannerList={BannerWithText(bannerWithTextData)} />
    </View>
    <View style={tw(`mx-4 my-5`)}>
      <View style={tw(`flex-row justify-between mt-6 mb-2`)}>
        <TextWrapper
          color=ThemebasedStyle.colorClass.textBlack
          textType={Head_800}
          text=SAFETY_SETUP
          overRideStyle={tw(`self-center`)}
        />
        <TextWrapper
          color=ThemebasedStyle.colorClass.textHigh
          textType={SBody_600}
          text=COMPLETE(
            `${string_of_int(completedSafetySetups())}/${string_of_int(
                safetySetupOptions()->Array.length,
              )}`,
          )
          overRideStyle={tw(`text-[#6D7280] self-center`)}
        />
      </View>
      <View>
        {safetySetupOptions()
        ->Array.mapWithIndex((item, index) => safetySetupView(item, index))
        ->React.array}
      </View>
    </View>
  </View>
}
