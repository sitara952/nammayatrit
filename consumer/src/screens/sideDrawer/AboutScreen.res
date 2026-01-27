open ReactNavigation
open ReactNative
open Style
open Tailwind

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let (appName, setAppName) = React.useState(() => "")
  React.useEffect0(() => {
    AppInfoModule.getName(~setAppName)->ignore
    None
  })

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp} backgroundColor="#F6F1FF">
    <HeaderWithSafeArea title={ABOUT} onBackPress />
    <View style={tw(` h-full px-4 py-8`)}>
      <View style={tw(` h-[330px] flex-col justify-between items-center`)}>
        <View style={tw(` h-[160px] flex-col items-center justify-between mb-[16px]`)}>
          <View style={tw(`flex-row items-center justify-center`)}>
            <Image
              source={Image.Source.fromRequired(
                Packager.require("../../resources/assets/png/mt_ic_logo_oy.png"),
              )}
              style={tw("w-[203px] h-[114px] mr-1 mb-[16px]")}
            />
          </View>
          <View>
            <TextWrapper
              text={APP_DESCRIPTION(appName)} textType={SHead_600} overRideStyle={tw("text-center")}
            />
          </View>
        </View>
        <View style={tw(`h-[126px] flex-col justify-between mt-[60px] `)}>
          <View style={tw("h-[90px] justify-between")}>
            <TouchableOpacity
              onPress={_ => Linking.openURL(Constants.termsAndCondLink)->Promise.done}>
              <View
                style={tw(
                  "h-[40px] justify-center items-center bg-fillNeutralMid rounded-full px-4",
                )}>
                <TextWrapper text={TERMS_AND_CONDITIONS} textType={Body_600} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_ => Linking.openURL(Constants.privacyPolicyLink)->Promise.done}>
              <View
                style={tw("h-[40px] justify-center items-center bg-fillNeutralMid rounded-full")}>
                <TextWrapper text={PRIVACY_POLICY} textType={Body_600} overRideStyle={tw(``)} />
              </View>
            </TouchableOpacity>
          </View>
          <TextWrapper
            text={CUSTOM_TEXT({text: ""})} //TODO: fetch BundleVersion
            textType={Body_600}
            overRideStyle={tw(`self-center`)}
            color=ThemebasedStyle.colorClass.textPrimary
          />
        </View>
      </View>
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
