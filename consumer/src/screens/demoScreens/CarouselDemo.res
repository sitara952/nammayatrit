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
          (),
        )}>
        <TextWrapper
          textType={Title_900}
          text=CUSTOM_TEXT({
            text: (carouselItems[index]->Option.getOr(defaultVal)).heading,
            accessibilityHintOverride: (carouselItems[index]->Option.getOr(defaultVal)).heading,
          })
        />
      </View>
    </View>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  <View
    style={viewStyle(
      ~flex=1.,
      ~alignItems=#center,
      ~justifyContent=#center,
      ~backgroundColor="#F5EDFF",
      (),
    )}>
    <TextWrapper textType={Title_900} text=CAROUSEL_DEMO />
    <Space />
    <View
      style={viewStyle(
        ~maxHeight=(Dimensions.get(#screen).height /. 2.0)->dp,
        ~width=(Dimensions.get(#screen).width /. 1.5)->dp,
        ~flex=1.,
        ~backgroundColor="white",
        ~borderRadius=8.,
        ~overflow=#hidden,
        (),
      )}>
      <Carousel.Carousel
        loop=true
        height={Dimensions.get(#screen).height /. 2.0}
        width={Dimensions.get(#screen).width /. 1.5}
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
  </View>
}
