open ReactNative
open Style

@react.component
let make = (~children, ~backgroundColor=?, ~paddingHorizontal=16.->dp) => {
  <View
    style={viewStyle(~flex=1., ~backgroundColor?, ~paddingHorizontal, ())}
    pointerEvents={#"box-none"}>
    <SafeAreaView />
    {children}
  </View>
}
