open ReactNavigation

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  <ScreenWrapperWithSafeArearViewAndPadding>
    <TextWrapper textType={Title_900} text={RIDE_DETAILS_SCREEN} />
  </ScreenWrapperWithSafeArearViewAndPadding>
}
