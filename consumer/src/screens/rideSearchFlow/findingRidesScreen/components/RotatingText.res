open ReactNative
open Style

type rotatingText = {
  text: string,
  color: string,
  textStyle: TextWrapper.textType,
  prefixImage: option<string>,
  prefixImageSize: float,
  postfixImage: option<string>,
  postfixImageSize: float,
  height: float,
  width: float,
}

let defaultRotatingData = {
  text: "Our drivers seem to be busy...",
  color: "#000000",
  textStyle: Body_600,
  prefixImage: None,
  prefixImageSize: 20.,
  postfixImage: None,
  postfixImageSize: 20.,
  height: 40.,
  width: {Dimensions.get(#screen).width -. 32.},
}

@react.component
let make = (
  ~textList: array<rotatingText>=[],
  ~height=20.,
  ~width=100.,
  ~backgroundColor="#EFE4FF",
  ~borderRadius=16.,
  ~borderColor="#EFE4FF",
  ~paddingVertical=16.->dp,
) => {
  <View
    pointerEvents={#none}
    style={viewStyle(
      ~backgroundColor,
      ~borderRadius,
      ~borderColor,
      ~borderWidth=1.,
      ~flexDirection=#row,
      ~justifyContent=#center,
      ~alignItems=#center,
      ~paddingHorizontal=0.->dp,
      ~paddingVertical,
      (),
    )}>
    <Carousel.Carousel
      loop={textList->Array.length > 1}
      data=textList
      width
      height
      autoPlayInterval=2500
      scrollAnimationDuration=1000
      onSnapToItem={_ => ()}
      vertical=true
      autoPlay=true
      renderItem={({index}) => {
        switch textList[index] {
        | Some(item) =>
          <View
            style={viewStyle(
              ~justifyContent=#center,
              ~alignItems=#center,
              ~height=height->dp,
              ~flexDirection=#row,
              (),
            )}>
            {switch item.prefixImage {
            | Some(img) =>
              <>
                <Svg.SvgXml
                  xml=img
                  height={item.prefixImageSize->Float.toString}
                  width={item.prefixImageSize->Float.toString}
                />
                <Space />
              </>
            | None => React.null
            }}
            <TextWrapper
              text=CUSTOM_TEXT({text: item.text}) textType=item.textStyle wrapeText=true
            />
            {switch item.postfixImage {
            | Some(img) =>
              <>
                <Space />
                <Svg.SvgXml
                  xml=img
                  height={item.postfixImageSize->Float.toString}
                  width={item.postfixImageSize->Float.toString}
                />
              </>
            | None => React.null
            }}
          </View>
        | None => React.null
        }
      }}
    />
  </View>
}
