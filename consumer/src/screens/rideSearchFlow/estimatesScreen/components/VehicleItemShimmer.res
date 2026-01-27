open ReactNative
open Style

@react.component
let make = (~loading) => {
  <View
    style={viewStyle(
      ~flexDirection=#row,
      ~flex=1.,
      ~alignItems=#center,
      ~padding=20.->dp,
      ~paddingRight=10.->dp,
      ~width=100.->pct,
      ~minHeight=100.->dp,
      ~justifyContent=#"flex-start",
      (),
    )}>
    <View>
      <ShimmerView isLoading=loading height="50" width="60" />
    </View>
    <View
      style={viewStyle(
        ~display=#flex,
        ~flex=1.,
        ~flexDirection=#column,
        ~justifyContent=#"flex-start",
        ~marginLeft=10.->dp,
        ~paddingTop=5.->dp,
        ~paddingBottom=5.->dp,
        (),
      )}>
      <View
        style={viewStyle(
          ~display=#flex,
          ~flex=1.,
          ~flexDirection=#row,
          ~justifyContent=#"space-between",
          (),
        )}>
        <ShimmerView isLoading=loading height="25" width="130" />
        <View style={viewStyle(~marginLeft=15.->dp, ())}>
          <ShimmerView isLoading=loading height="25" width="50" />
        </View>
      </View>
      <View
        style={viewStyle(
          ~display=#flex,
          ~flexDirection=#row,
          ~justifyContent=#"flex-start",
          ~alignItems=#center,
          (),
        )}>
        <View style={viewStyle(~display=#flex, ~alignItems=#center, ())}>
          <ShimmerView isLoading=loading height="20" width="200" />
        </View>
      </View>
    </View>
  </View>
}
