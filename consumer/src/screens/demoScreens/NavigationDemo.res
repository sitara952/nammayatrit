open ReactNavigation
open ReactNative
open Style
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (_, setNavigationState) = React.useContext(NavigationStateContext.navigationStateContext)

  <ScreenWrapperWithSafeArearViewAndPadding>
    <View style={viewStyle(~flex=1., ~alignItems=#center, ~justifyContent=#center, ())}>
      <CustomButton
        borderWidth=0.
        borderRadius=8.
        onPress={_ => setNavigationState(_ => MainApp(HomeScreen, None))}
        text="Navigate to Main App"
      />
      <Space />
      <CustomButton
        borderWidth=0.
        borderRadius=8.
        onPress={_ => setNavigationState(_ => CustomerOnboarding)}
        text="Navigate to Customer Onboarding"
      />
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
