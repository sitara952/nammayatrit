open ReactNative
open Style

let styles = {
  "confirm_pickup_container": viewStyle(
    ~flex=1.0,
    ~paddingVertical=24.0->dp,
    ~paddingHorizontal=16.0->dp,
    ~marginTop=16.->dp,
    ~position=#absolute,
    ~bottom=0.0->dp,
    ~borderTopLeftRadius=16.,
    ~borderTopRightRadius=16.,
    ~width=100.0->pct,
    ~height=100.0->pct,
    ~flexWrap=#nowrap,
    ~backgroundColor=ThemebasedStyle.colorString.fillPrimaryLow,
    (),
  ),
  "reanimated_view_container": viewStyle(
    ~flex=1.0,
    ~width=100.0->pct,
    ~height=100.0->pct,
    ~direction=#inherit,
    ~alignItems=#center,
    ~justifyContent=#center,
    ~backgroundColor="transparent",
    (),
  ),
}
@react.component
let make = (
  ~viewStyle: ReactNative.Style.t,
  ~titleText: LocaleStringType.localeString,
  ~buttonText: string,
  ~onPress: ReactNative.Event.pressEvent => unit,
  ~children: React.element,
  ~locationList: array<LocationTypes.location>,
  ~handleSearchListItemPress: LocationTypes.location => unit,
  ~selectedGateId: option<string>,
  ~setSelectedGateId: (option<string> => option<string>) => unit,
) => {
  <View style={viewStyle}>
    <TextWrapper
      text={titleText}
      textType={SHead_700}
      overRideStyle={textStyle(
        ~width=100.0->pct,
        ~color=ThemebasedStyle.colorString.fillNeutralBlack,
        ~textAlign=#left,
        (),
      )}
    />
    {children}
    {LocationPickupUtils.renderListItem(
      locationList,
      handleSearchListItemPress,
      selectedGateId,
      setSelectedGateId,
    )}
    <CustomButton
      backgroundColor=ThemebasedStyle.colorString.fillNeutralBlack
      text=buttonText
      onPress
      useFlex=true
      textType={SHead_700}
      borderRadius=12.
      buttonSize=Large
      rightIcon={NoIcon}
    />
  </View>
}
