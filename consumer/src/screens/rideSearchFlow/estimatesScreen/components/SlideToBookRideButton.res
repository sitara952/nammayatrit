open ReactNative
open Style
open Reanimated
open Tailwind

let swipeDistance = ReactNative.Dimensions.get(#screen).width -. 32.
let endSwipeDistance = swipeDistance -. 66. -. 6.

@react.component
let make = (~onSlideEnd: unit => unit=_ => ()) => {
  let translateX = useSharedValue(0.)
  let rideActivated = useSharedValue(0.)

  let panGesture =
    Gesture.makePan()
    ->Pan.onUpdate(e => {
      let interpolatedTranslateValue = interpolate(
        e.translationX,
        [0., swipeDistance],
        [0., endSwipeDistance],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      )
      translateX.value = interpolatedTranslateValue
    })
    ->Pan.onEnd((event, _success) => {
      if event.translationX <= swipeDistance /. 2.0 {
        translateX.value = withTiming(~toValue=1.0, ~userOption={duration: 300.0})
      } else {
        translateX.value = withTiming(~toValue=endSwipeDistance, ~userOption={duration: 300.0})
        rideActivated.value = withTiming(~toValue=1.0, ~userOption={duration: 300.0})
        setTimeout(() => {
          onSlideEnd()
        }, 1000)->ignore
      }
    })

  let animatedTranslateStyle = useAnimatedStyle(() => {
    viewStyle(
      ~transform=[ReactNative.Style.translateX(~translateX=translateX.value)],
      ~opacity=rideActivated.value === 0.0 ? 1.0 : 0.0,
      (),
    )
  })

  let animatedTranslateTextStyle = useAnimatedStyle(() => {
    textStyle(
      ~opacity=interpolate(
        translateX.value,
        [55.0, swipeDistance /. 2.0],
        [1.0, 0.0],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      ),
      (),
    )
  })

  let animatedButtonLoadingStyle = useAnimatedStyle(() => {
    viewStyle(
      ~width=interpolate(
        rideActivated.value,
        [0.0, 1.0],
        [swipeDistance, 55.0],
        Some(Reanimated.ExtrapolationType.asString("extend")),
      )->dp,
      ~borderRadius=interpolate(
        rideActivated.value,
        [0.0, 1.0],
        [10.0, 9999.0],
        Some(Reanimated.ExtrapolationType.asString("extend")),
      ),
      (),
    )
  })

  let animatedSpinnerStyle = useAnimatedStyle(() => {
    viewStyle(
      ~opacity=interpolate(
        rideActivated.value,
        [0.5, 1.0],
        [0.0, 1.0],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      ),
      (),
    )
  })

  <ReanimatedView style={tw("px-4 items-center")}>
    <ReanimatedView
      style={array([
        tw(
          "relative overflow-visible bg-[#171723] rounded-[10px] h-[55px] justify-center items-center",
        ),
        animatedButtonLoadingStyle,
      ])}>
      <AnimatedText
        style={array([
          tw("text-[19px] font-extraBold text-[#797986]"),
          animatedTranslateTextStyle,
        ])}>
        {React.string("Slide to book ride")}
      </AnimatedText>
      <GestureDetector gesture={Gesture.pan(panGesture)}>
        <ReanimatedView
          style={array([
            tw(
              "absolute h-[51px] w-[66px] rounded-[8px] left-[2px] bg-[#C281FF] flex-row justify-center items-center overflow-visible",
            ),
            animatedTranslateStyle,
            viewStyle(
              ~shadowColor="#7f11e063",
              ~shadowOffset={offset(~width=9.0, ~height=9.0)},
              ~shadowRadius=10.,
              ~shadowOpacity=1.,
              ~elevation=2.,
              (),
            ),
          ])}>
          <CarIcon />
          <ReanimatedView style={tw("h-[14px] w-[14px] ml-1.5")}>
            <ArrowRight fill="black" />
          </ReanimatedView>
        </ReanimatedView>
      </GestureDetector>
      <ReanimatedView
        style={array([tw("absolute h-[55px] justify-center items-center"), animatedSpinnerStyle])}>
        <ActivityIndicator color="#FFFFFF80" size={ActivityIndicator.Size.small} />
      </ReanimatedView>
    </ReanimatedView>
  </ReanimatedView>
}
