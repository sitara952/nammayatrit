open ReactNative
open Style

@react.component
let make = (
  ~textType=TextWrapper.Body_700,
  ~paddingVertical=5.->dp,
  ~paddingHorizontal=12.->dp,
  ~overRideStyle=viewStyle(),
  ~primaryText=?,
  ~icon=?,
  ~iconHeight="15",
  ~iconWidth="15",
  ~secondaryText=?,
  ~backgroundColor=?,
  ~color=?,
  ~primaryTextFontSize=16.,
  ~secondryTextFontSize=16.,
  ~secondryTextFontWeight=#500,
  ~height=20.->dp,
  ~width=77.->dp,
  ~borderRadius=18.,
  ~iconPaddingLeft=5.->dp,
) => {
  // add this line

  let textColor = switch color {
  | Some(val) => val
  | None => "#ffffff"
  }
  let bgColor = switch backgroundColor {
  | Some(val) => val
  | None => ""
  }
  let styles = {
    "parent": viewStyle(
      ~borderRadius,
      ~backgroundColor=bgColor,
      ~flexDirection=#row,
      ~paddingVertical,
      ~paddingHorizontal,
      ~justifyContent=#center,
      (),
    ),
    "primaryText": textStyle(~color=textColor, ~fontWeight=#500, ~fontSize=primaryTextFontSize, ()),
    "secondaryText": textStyle(
      ~color=textColor,
      ~fontWeight=secondryTextFontWeight,
      ~fontSize=secondryTextFontSize,
      ~paddingLeft=5.->dp,
      ~fontFamily="area-normal",
      (),
    ),
    "iconParent": viewStyle(~alignSelf=#center, ~marginLeft=iconPaddingLeft, ()),
  }
  <View style={array([styles["parent"], viewStyle(~width={width}, ~height={height}, ())])}>
    {switch primaryText {
    | Some(val) => <Text style={styles["primaryText"]}> {React.string(val)} </Text>
    | None => React.null
    }}
    {switch icon {
    | Some(val) =>
      <View style={styles["iconParent"]}>
        <Svg.SvgXml xml=val width={iconHeight} height={iconHeight} />
      </View>
    | None => React.null
    }}
    {switch secondaryText {
    | Some(val) => <Text style={styles["secondaryText"]}> {React.string(val)} </Text>
    | None => React.null
    }}
  </View>
}
