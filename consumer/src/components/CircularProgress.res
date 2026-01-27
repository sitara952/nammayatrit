module AnimatedCircle = {
  @module("react-native-svg")
  external circleComponent: React.component<Svg.Circle.props> = "Circle"

  type props = {
    ...Svg.Circle.props,
    animatedProps: ReactNative.Style.t,
  }
  let make: React.component<props> = Reanimated.createAnimatedComponent(circleComponent)
}

open ReactNative

let styles = {
  open Style
  StyleSheet.create({
    // ...StyleSheet.absoluteFillObject,
    "container": viewStyle(~justifyContent=#center, ~alignItems=#center, ()),
    "powerText": textStyle(~fontSize=30., ~fontWeight=#300, ()),
    "powerPercentage": textStyle(~fontSize=60., ~fontWeight=#200, ()),
  })
}

module CircularProgressBase = {
  @react.component
  let make = (~radius: float, ~strokeWidth: int, ~percentageComplete: float) => {
    let innerRadius = radius -. strokeWidth->Int.toFloat /. 2.
    let circumference = (2. *. Math.Constants.pi *. innerRadius)->Float.toFixed(~digits=2)
    let invertedCompletion = (100. -. percentageComplete) /. 100.

    let animateTo = Reanimated.useDerivedValue(() => {
      // 0.01 is added to make zero percent not look empty
      2. *. Math.Constants.pi *. invertedCompletion +. 0.01
    })

    let fadeDelay = 1500.

    let animatedProps = Reanimated.useAnimatedProps(() => {
      {
        "strokeDashoffset": Reanimated.withTiming(
          ~toValue=animateTo.value *. innerRadius,
          ~userOption={duration: fadeDelay},
        ),
      }
    })

    let radiusStr = radius->Float.toFixed(~digits=2)

    <View style={Style.array([StyleSheet.absoluteFillObject, styles["container"]])}>
      <Svg style={StyleSheet.absoluteFill}>
        <Svg.Defs>
          <Svg.LinearGradient id="Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Svg.Stop offset="0%" stopColor="#9E51FF" stopOpacity=".8" />
            <Svg.Stop offset="100%" stopColor="#426EF6" stopOpacity=".8" />
          </Svg.LinearGradient>
        </Svg.Defs>
        <Svg.G transform={`rotate(-90 ${radiusStr} ${radiusStr})`}>
          <AnimatedCircle
            animatedProps={animatedProps}
            cx={radiusStr}
            cy={radiusStr}
            fill="transparent"
            stroke="url(#Gradient)"
            r={innerRadius->Float.toFixed(~digits=2)}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeWidth={strokeWidth->Int.toString}
            strokeLinecap="round"
          />
        </Svg.G>
      </Svg>
    </View>
  }
}

module RandomPercentGenerator = {
  let getRandomPercent = () => (Math.random() *. 100.)->Float.toInt
  let useRandomPercent = () => {
    let (percent, setPercent) = React.useState(() => getRandomPercent())

    React.useEffect0(() => {
      let interval = setInterval(() => {
        setPercent(_ => getRandomPercent())
      }, 2000)

      Some(() => clearInterval(interval))
    })

    percent
  }
}

module Previewer = {
  open Style

  @react.component
  let make = (~radius=75., ~children, ~percent) => {
    let height = radius *. 2.
    let shadowStyle = ShadowHook.useGetShadowStyle(~shadowIntensity=2., ())
    <View
      style={array([
        viewStyle(
          ~width=height->dp,
          ~height=height->dp,
          ~backgroundColor="white",
          ~borderRadius=radius,
          ~position=#relative,
          (),
        ),
        shadowStyle,
      ])}>
      <CircularProgressBase radius strokeWidth=4 percentageComplete=percent />
      <View
        style={viewStyle(
          ~position=#absolute,
          ~width=100.->pct,
          ~height=100.->pct,
          ~alignItems=#center,
          ~justifyContent=#center,
          (),
        )}>
        children
      </View>
    </View>
  }
}

let make = CircularProgressBase.make
