open GestureDetector
open Reanimated
open ReactNative
open Style

external runOnUIHack: string => ReactNative.Style.angle = "%identity"

@react.component
let make = (~animatedPosition: SharedValue.t<'t>, ~children, ~onRightSwipe, ~onLeftSwipe) => {
  let translateX = useSharedValue(0.)
  //   TODO: Uncomment the code once haptics are integrated
  //     useAnimatedReaction(
  //     () => animatedPosition.value,
  //     (next, prev) => {
  //       if (next >= 100. && prev && prev < 100.) {
  //         haptic && runOnJS(haptic)();
  //       }
  //       if (next <= -100. && prev && prev > -100.) {
  //         hapticHeavy && runOnJS(hapticHeavy)();
  //       }
  //     }
  //   );

  let panGesture =
    Gesture.makePan()
    ->Pan.onUpdate(event => {
      translateX.value = event.translationX
      animatedPosition.value = event.translationX
    })
    ->Pan.onEnd((event, _) => {
      if event.translationX > 100. {
        // Translating to the right
        translateX.value = withSpring(
          ~toValue=615.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(18.),
            stiffness: Some(220.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
        animatedPosition.value = withSpring(
          ~toValue=615.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(18.),
            stiffness: Some(220.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
        onRightSwipe()
      } else if event.translationX < -100. {
        // Translating to the left
        translateX.value = withSpring(
          ~toValue=-615.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(18.),
            stiffness: Some(220.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
        animatedPosition.value = withSpring(
          ~toValue=-615.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(18.),
            stiffness: Some(220.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
        onLeftSwipe()
      } else {
        translateX.value = withSpring(
          ~toValue=0.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(28.),
            stiffness: Some(180.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
        animatedPosition.value = withSpring(
          ~toValue=0.,
          ~userConfig={
            mass: Some(1.),
            damping: Some(28.),
            stiffness: Some(180.),
            overshootClamping: Some(false),
            restDisplacementThreshold: None,
            restSpeedThreshold: None,
            velocity: None,
          },
        )
      }
    })

  let animatedCardStyle = useAnimatedStyle(() => {
    viewStyle(
      ~transform=[
        ReactNative.Style.translateX(~translateX=translateX.value),
        ReactNative.Style.rotate(
          ~rotate={
            runOnUIHack(
              Belt.Float.toString(
                interpolate(translateX.value, [-100., 0., 100.], [-10., 0., 10.], None),
              ) ++ "deg",
            )
          },
        ),
      ],
      (),
    )
  })

  // let handleOnLayout = (e: ReactNative.Event.layoutEvent) => {
  //   // translateX.value = withDelay(
  //   //   100,
  //   //   withSpring(25, {damping: 28, stiffness: 180}, finished => {
  //   //     translateX.value = withSpring(-25, {damping: 28, stiffness: 180}, finished => {
  //   //       translateX.value = withSpring(0, {damping: 28, stiffness: 180})
  //   //     })
  //   //   }),
  //   // )
  // }

  <GestureDetector gesture={Gesture.pan(panGesture)}>
    // TODO: Add enter and exit animations
    <ReanimatedView
      // onLayout={handleOnLayout}
      style={array([animatedCardStyle])}>
      {children}
    </ReanimatedView>
  </GestureDetector>
}
