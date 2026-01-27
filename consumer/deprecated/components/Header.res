open ReactNative
open Style

@react.component
let make = (~onBack=?, ~title=?, ~height=80.->dp) => {
  let {headerBgColor} = ThemebasedStyle.useThemeBasedStyle()

  <View
    style={viewStyle(
      ~justifyContent=#"flex-end",
      ~alignItems=#"flex-start",
      ~backgroundColor=headerBgColor,
      ~paddingHorizontal=16.->dp,
      ~height,
      (),
    )}>
    <View style={viewStyle(~flexDirection=#row, ~justifyContent=#center, ())}>
      <View style={viewStyle(~justifyContent=#center, ())}>
        <TouchableOpacity
          style={viewStyle(~marginVertical=12.->dp, ())}
          onPress={_ => onBack->Option.map(cb => cb())->ignore}>
          <Svg.SvgXml xml=Back.svg width="20" height="20" />
        </TouchableOpacity>
      </View>
      {if title->Option.isSome {
        let headerTitle = title->Option.getExn
        <View style={viewStyle(~justifyContent=#center, ~paddingLeft=16.->dp, ())}>
          <TextWrapper text={CUSTOM_TEXT({text: headerTitle})} textType={SHead_700} />
        </View>
      } else {
        <View />
      }}
    </View>
  </View>
}
