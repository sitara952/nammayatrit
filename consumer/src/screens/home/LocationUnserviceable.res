open ReactNative
open Style
open ReactNavigation
open Native

@react.component
let make = (~snapToIndex) => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)

  useFocusEffect(() => {
    Console.log("Inside LocationUnserviceable Screen. SnapToIndex")
    snapToIndex(0.)
    None
  })
  <View
    style={viewStyle(
      ~alignItems=#center,
      ~flex=1.,
      ~marginTop=24.->dp,
      ~backgroundColor={"#FFFFFF"},
      ~borderTopLeftRadius=16.,
      ~borderTopRightRadius=16.,
      ~paddingHorizontal=16.->dp,
      ~paddingVertical=24.->dp,
      (),
    )}>
    <Svg.SvgXml xml=LocationUnserviceableImage.svg />
    <Space height=16. />
    <TextWrapper
      text={LOCATION_UNSERVICEABLE}
      overRideStyle={textStyle(~color="#454545", ~textAlign=#center, ())}
      textType={Title_800}
    />
    <Space height=8. />
    <TextWrapper
      text={WE_ARE_NOT_LIVE_IN_YOUR_AREA_}
      overRideStyle={textStyle(~color="#6D7280", ~textAlign=#center, ())}
      textType={Body_600}
    />
    <Space height=16. />
    <TextWrapper
      text={FACING_PROBLEMS_WITH_THE_APP}
      overRideStyle={textStyle(~color="#6D7280", ~textAlign=#center, ())}
      textType={SBody_600}
    />
    <Space height=2. />
    <TouchableOpacity>
      <TextWrapper
        text={TAP_HERE_TO_REPORT_ISSUE}
        overRideStyle={textStyle(~color="#7D4BFF", ~textAlign=#center, ())}
        textType={SBody_600}
      />
    </TouchableOpacity>
    <Space height=24. />
    <CustomButton
      backgroundColor="#171723"
      text={GetLocale.getLocale(TRY_ANOTHER_LOCATION).text}
      textType={SHead_700}
      onPress={_ => {
        setRideSearchData({
          ...rideSearchData,
          source: None,
          destination: None,
        })
        rideFlowAction(UpdateStage(RideFlowContext.Search(0)))
      }}
      useFlex=true
      borderRadius=12.
      buttonSize=Large
      rightIcon={NoIcon}
    />
  </View>
}
