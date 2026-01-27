open Reanimated
open ReactNative
open Style
open Utils

type item = {
  id: string,
  heading: string,
  subHeading: string,
  index: int,
  active: bool,
}

@react.component
let make = (
  ~item: item,
  ~index: int,
  ~lastItemIndex: int,
  ~cardHeight: int,
  ~cardVerticalSpacing: int,
  ~snapFactor: float,
  ~scrollOffsetY: Reanimated.SharedValue.t<float>,
) => {
  let inputRange = React.useMemo1(
    () => [
      Int.toFloat(index - 1) *. snapFactor,
      Int.toFloat(index) *. snapFactor,
      Int.toFloat(index + 1) *. snapFactor,
    ],
    [index],
  )

  let iStyle = useAnimatedStyle1(() => {
    viewStyle(
      ~opacity=interpolate(
        scrollOffsetY.value,
        inputRange,
        [0., 1., 0.],
        Some(ExtrapolationType.asString("clamp")),
      ),
      (),
    )
  }, [])

  let rStyle = useAnimatedStyle1(() => {
    viewStyle(
      ~opacity=interpolate(
        scrollOffsetY.value,
        inputRange,
        [0.45, 1., 0.45],
        Some(ExtrapolationType.asString("clamp")),
      ),
      ~transform=[
        perspective(~perspective=withTiming(~toValue=250., ~userOption={})),
        rotateX(
          ~rotateX={
            runOnUIHack(
              interpolate(
                scrollOffsetY.value,
                inputRange,
                [-30., 0., 30.],
                Some(ExtrapolationType.asString("clamp")),
              )->Js.Float.toString ++ "deg",
            )
          },
        ),
        scale(
          ~scale=interpolate(
            scrollOffsetY.value,
            inputRange,
            [0.9, 1., 0.9],
            Some(ExtrapolationType.asString("clamp")),
          ),
        ),
      ],
      (),
    )
  }, [])

  let marginStyle = {
    if item.index === 0 {
      viewStyle(
        ~marginBottom=Int.toFloat(cardVerticalSpacing)->dp,
        ~marginTop=Int.toFloat(cardHeight + cardVerticalSpacing * 2)->dp,
        (),
      )
    } else if item.index === lastItemIndex {
      viewStyle(
        ~marginTop=Int.toFloat(cardVerticalSpacing)->dp,
        ~marginBottom=Int.toFloat(cardHeight + cardVerticalSpacing * 2)->dp,
        (),
      )
    } else {
      viewStyle(~marginVertical=Int.toFloat(cardVerticalSpacing)->dp, ())
    }
  }

  <ReanimatedView
    style={array([
      viewStyle(
        ~flex=1.,
        ~paddingLeft=15.->dp,
        ~justifyContent=#center,
        ~backgroundColor="#fff",
        ~height=Int.toFloat(cardHeight)->dp,
        ~borderRadius=15.,
        (),
      ),
      marginStyle,
      rStyle,
    ])}>
    <TouchableOpacity
      key={index->Int.toString}
      style={viewStyle(~flexDirection=#row, ~alignItems=#center, ())}
      onPress={_ => ()}>
      <ReanimatedView style={array([viewStyle(~marginRight=5.->dp, ()), iStyle])}>
        <Svg.SvgXml xml=SpecialLocationGateSelected.svg width={"25"} height={"25"} />
      </ReanimatedView>
      <View>
        <TextWrapper text=CUSTOM_TEXT({text: item.heading}) textType={SHead_700} />
        <TextWrapper
          text={CUSTOM_TEXT({text: item.subHeading->wrapString(30)})}
          textType={SBody_600}
          overRideStyle={textStyle(~color="#5C6A77", ())}
        />
      </View>
    </TouchableOpacity>
  </ReanimatedView>
}
