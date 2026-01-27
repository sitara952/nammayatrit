open ReactNavigation
open ReactNative
open Style

type carouselItem = {
  heading: string,
  subHeading: string,
  svgString: string,
}
let defaultVal: carouselItem = {
  heading: "",
  subHeading: "",
  svgString: "",
}
let carouselItems: array<carouselItem> = [
  {
    heading: "The fastest ride booking app is here!",
    subHeading: "Our speedy booking process means you get a ride quickly and easily.",
    svgString: GettingStartted1.svg,
  },
  {
    heading: "Dedicated Safety Center",
    subHeading: "24X7 self serve feature and SOS for  emergency support",
    svgString: GettingStartted2.svg,
  },
  {
    heading: "Inclusive and accessible, for everyone!",
    subHeading: "We strive to provide all our users an even & equal experience.",
    svgString: GettingStartted3.svg,
  },
  {
    heading: "Be a part of the Open Mobility Revolution!",
    subHeading: "Our data and product roadmap are transparent for all.",
    svgString: GettingStartted4.svg,
  },
]

module RenderItem = {
  @react.component
  let make = (~carouselItems, ~index) => {
    let (loading, setLoading) = React.useState(_ => true)
    React.useEffect0(() => {
      setLoading(_ => false)
      None
    })
    <View style={viewStyle(~flex=1., ~alignItems=#center, ~justifyContent=#center, ())}>
      {loading
        ? <ActivityIndicator style={viewStyle(~width=100.->pct, ~height=75.->pct, ())} />
        : <Svg.SvgXml
            onError={() => {
              ()
            }}
            onLoad={() => {
              setLoading(_ => false)
            }}
            xml={(carouselItems[index]->Option.getOr(defaultVal)).svgString}
            width="100%"
            height="75%"
            fill="red"
          />}
      <Space />
      <View
        style={viewStyle(
          ~alignItems=#center,
          ~justifyContent=#center,
          ~paddingHorizontal=20.->dp,
          ~overflow=#hidden,
          (),
        )}>
        <TextWrapper
          textType={Title_900}
          text=CUSTOM_TEXT({
            text: (carouselItems[index]->Option.getOr(defaultVal)).heading,
            accessibilityHintOverride: (carouselItems[index]->Option.getOr(defaultVal)).heading,
          })
        />
        <Space />
        <TextWrapper
          textType={SHead_700}
          text=CUSTOM_TEXT({
            text: (carouselItems[index]->Option.getOr(defaultVal)).subHeading,
            accessibilityHintOverride: (carouselItems[index]->Option.getOr(defaultVal)).subHeading,
          })
        />
      </View>
    </View>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  <View
    style={viewStyle(
      ~flex=1.,
      ~alignItems=#center,
      ~justifyContent=#"space-between",
      ~backgroundColor="#F5EDFF",
      (),
    )}>
    {<View style={viewStyle(~alignItems=#center, ())}>
      <Space height=70. />
      <Svg.SvgXml xml=BridgeLogo.svg width="40%" height="10%" />
      <View
        style={viewStyle(~flexShrink=1., ~height=(Dimensions.get(#screen).height /. 1.6)->dp, ())}>
        <Carousel.Carousel
          loop=true
          width={Dimensions.get(#screen).width}
          height={Dimensions.get(#screen).height /. 1.6}
          autoPlay=true
          data=carouselItems
          autoPlayInterval=2500
          scrollAnimationDuration=1000
          onSnapToItem={_ => ()}
          vertical=false
          renderItem={({index}) => {
            <RenderItem carouselItems index />
          }}
        />
      </View>
    </View>}
    <View style={viewStyle(~paddingHorizontal=15.->dp, ())}>
      <CustomButton
        borderWidth=0.
        borderRadius=8.
        onPress={_ =>
          Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.enterMobileNumber)}
        text="Get Started"
      />
    </View>
    <Space />
  </View>
}
