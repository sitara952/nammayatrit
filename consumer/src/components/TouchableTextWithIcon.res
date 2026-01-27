open ReactNative
open Style

@genType
type customTagIcon = {
  backgroundColor: string,
  color: string,
  strokeColor: string,
}

@genType
type componentType =
  | Light
  | Dark
  | Purple
  | CustomTagIcon(customTagIcon)

@react.component
let make = (
  ~onPress,
  ~text=?,
  ~icon: option<string>,
  ~iconSize="11",
  ~paddingHorizontal=15.->dp,
  ~paddingVertical=6.->dp,
  ~borderWidth=1.,
  ~borderRadius=40.,
  ~marginVertical=3.->dp,
  ~marginHorizontal=0.->dp,
  ~componentType=Light,
  ~textType=TextWrapper.Body_700,
  ~overRideTextColor=?,
  ~flexWrap=#wrap,
  ~gapWidth=10.0,
  ~overRideStyle=?,
  ~shadowIntensity=2.,
) => {
  let getShadowStyle = ShadowHook.useGetShadowStyle(~shadowIntensity, ())

  let (borderColor, backgroundColor, color) = switch componentType {
  | Light => ("#DBE0E7", "#FCFCFD", "#161622")
  | Dark => ("#161622", "#161622", "white")
  | Purple => ("#8D45FA", "#EFE4FF", "#8519FC")
  | CustomTagIcon(customTagIcon) => (
      customTagIcon.strokeColor,
      customTagIcon.backgroundColor,
      customTagIcon.color,
    )
  }

  let styles = StyleSheet.create({
    "viewStyle": viewStyle(
      ~flexDirection=#row,
      ~backgroundColor,
      ~alignItems=#center,
      ~paddingHorizontal,
      ~paddingVertical,
      ~borderWidth,
      ~borderColor,
      ~borderRadius,
      ~marginVertical,
      (),
    ),
  })

  let color = overRideTextColor->Option.getOr(color)
  let styles = overRideStyle->Option.getOr(styles)

  <View style={viewStyle(~flexWrap, ())}>
    <TouchableOpacity onPress style={array([styles["viewStyle"], getShadowStyle])}>
      {switch icon {
      | Some(val) => <Svg.SvgXml xml=val height=iconSize width=iconSize />
      | None => React.null
      }}
      {switch (icon, text) {
      | (Some(_), Some("")) => React.null
      | (Some(_), Some(_)) => <Space width=gapWidth />
      | _ => React.null
      }}
      {switch text {
      | None => React.null
      | Some(val) =>
        <TextWrapper
          textType text={CUSTOM_TEXT({text: val})} overRideStyle={textStyle(~color, ())}
        />
      }}
    </TouchableOpacity>
  </View>
}
