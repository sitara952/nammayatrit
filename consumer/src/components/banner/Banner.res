open ReactNative
open Style

// TODO: Add dynamic support for custom banners and image banners, hence commenting the card code for now
@react.component
let make = (
  ~height=200.->dp,
  ~width=100.->pct,
  ~heading="",
  ~subHeading="",
  ~image="",
  ~imageUrl="",
  ~imageWidth=131.,
  ~imageHeight=108.,
) => {
  //  let getShadowStyle = ShadowHook.useGetShadowStyle(~shadowIntensity=2., ())()
  <View style={viewStyle(~paddingHorizontal=16.->dp, ())}>
    <ReImage
      style={imageStyle(
        ~width=100.->pct,
        ~height=100.->pct,
        ~overflow=#hidden,
        ~resizeMode=#contain,
        (),
      )}
      uri=imageUrl
    />
    // <View
    //   style={viewStyle(
    //     ~flexDirection=#row,
    //     ~flexWrap=#nowrap,
    //     ~justifyContent=#"space-between",
    //     ~width,
    //     ~height,
    //     ~borderRadius=8.,
    //     ~shadowColor="#000000",
    //     ~shadowRadius=13.16,
    //     ~elevation=5.,
    //     ~shadowOffset={
    //       offset(~width=0., ~height=10.)
    //     },
    //     ~paddingHorizontal=16.->dp,
    //     ~paddingVertical=5.->dp,
    //     ~backgroundColor="#FCFCFD",
    //     ~alignItems=#center,
    //     ~borderColor="#E0E3E8",
    //     ~borderWidth=1.,
    //     (),
    // )}>
    // <View style={viewStyle(~alignItems=#"flex-start", ~width=65.->pct, ())}>
    //   <TextWrapper
    //     textType=Title_800
    //     color=ThemebasedStyle.colorClass.textBlack
    //     text={CUSTOM_TEXT({text: heading})}
    //   />
    //   <TextWrapper
    //     text=CUSTOM_TEXT({text: subHeading})
    //     color=ThemebasedStyle.colorClass.textBlack
    //     textType={SBody_400}
    //   />
    // </View>
    // <Image
    //   source={Image.Source.fromRequired(Packager.require("../../resources/assets/png/banner_driver.png"))}
    //   style={imageStyle(
    //     ~overflow=#hidden,
    //     ~borderRadius=8.0,
    //     ~resizeMode=#stretch,
    //     ~width=imageWidth->dp,
    //     ~height=imageHeight->dp,
    //     (),
    //   )}
    // />
    // </View>
  </View>
}
