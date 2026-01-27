open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper
      textType={Title_900}
      text=CUSTOM_TEXT({
        text: "Enter Mobile Number Screen",
      })
    />
    <CustomButton
      text="Go to enter OTP Screen"
      onPress={_ => {
        Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.enterOtp)
      }}
    />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
