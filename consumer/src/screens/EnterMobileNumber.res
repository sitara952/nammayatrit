open ReactNavigation
open ReactNative
open Style
open Reanimated

module IncreaseWidthAnimation = {
  @react.component
  let make = () => {
    let width = useSharedValue(100.)
    let handlePressToIncreaseWidth = _ => {
      width.value = withSpring(~toValue=width.value +. 100.)
    }
    let animatedStyles = useAnimatedStyle(() => viewStyle(~width=width.value->dp, ()))

    <>
      <TextWrapper textType={Title_900} text={INCREASE_WITH_ANIMATION} />
      <Space />
      <ReanimatedView
        style={array([
          animatedStyles,
          viewStyle(~height=60.->dp, ~borderRadius=10., ~backgroundColor="violet", ()),
        ])}
      />
      <Button onPress={handlePressToIncreaseWidth} title="Click me" />
    </>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  <ScreenWrapperWithSafeArearViewAndPadding>
    <View style={viewStyle(~flex=1., ~alignItems=#center, ())}>
      <Space height=60. />
      <TextWrapper textType={Title_900} text={REACT_NATIVE_ANIMATIONS} />
      <Space height=60. />
      <IncreaseWidthAnimation />
      <CustomButton
        borderWidth=0.
        borderRadius=8.
        // onPress={_ => setNavigationState(ComponentsPreview)}
        text="Navigate to ComponentsPreview"
      />
      //   <AnimatedStyleUpdateExample />
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
