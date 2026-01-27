open Reanimated
open Tailwind

module LocationPinIcon = {
  @react.component
  let make = () => {
    <Svg width="74" height="74" viewBox="0 0 74 74" fill="none">
      <Svg.Path
        d="M24.4295 6.00187C31.7953 1.72204 40.8491 1.79684 48.1457 6.19782C55.3706 10.6884 59.7618 18.7029 59.7211 27.3241C59.5527 35.8889 54.8442 43.9397 48.9585 50.1634C45.5615 53.7717 41.7613 56.9624 37.6356 59.6702C37.2107 59.9159 36.7453 60.0804 36.2623 60.1556C35.7974 60.1358 35.3447 59.9984 34.945 59.7559C28.6464 55.6872 23.1205 50.4936 18.6333 44.425C14.8786 39.3594 12.7454 33.2393 12.5234 26.8959L12.5402 25.9731C12.8468 17.6931 17.3268 10.1289 24.4295 6.00187ZM39.1811 19.8174C36.1867 18.5446 32.7344 19.2361 30.4361 21.569C28.1378 23.902 27.4469 27.4161 28.6859 30.4707C29.9249 33.5253 32.8495 35.5177 36.0941 35.5177C38.2197 35.533 40.263 34.6816 41.7687 33.1532C43.2744 31.6248 44.1174 29.5465 44.1099 27.3812C44.1212 24.0762 42.1754 21.0902 39.1811 19.8174Z"
        fill="#7D4BFF"
      />
      <Svg.Path
        opacity="0.4"
        d="M36.123 70.2699C45.4326 70.2699 52.9794 68.7605 52.9794 66.8986C52.9794 65.0367 45.4326 63.5273 36.123 63.5273C26.8135 63.5273 19.2666 65.0367 19.2666 66.8986C19.2666 68.7605 26.8135 70.2699 36.123 70.2699Z"
        fill="#E0D1FF"
      />
    </Svg>
  }
}

@react.component
let make = (~setAskLocationPermission) => {
  let askLocationPermValue = React.useContext(PermissionsContext.permissionContext)

  let handleApproveClick = () => {
    askLocationPermValue.locationPermSetter(true)
    setAskLocationPermission(_ => true)
  }
  <ReanimatedView style={tw("bg-white flex-1 pt-5 px-4")}>
    <TextWrapper
      text={LOCATION_ACCESS_HEADER}
      overRideStyle={tw("text-[#14171F] py-1.5 pb-4")}
      textType={Head_800}
    />
    <ReanimatedView style={tw("h-[1px] bg-fillNeutralMid")} />
    <ReanimatedView style={tw("flex flex-row justify-between items-center pt-4")}>
      <TextWrapper
        text={LOCATION_ACCESS_INFO}
        overRideStyle={tw("text-textHigh max-w-3/4")}
        textType={Body_600}
      />
      <LocationPinIcon />
    </ReanimatedView>
    <ReanimatedView style={tw("pt-6")}>
      <FullWidthButton handlePress={_ => handleApproveClick()} text="Allow" />
    </ReanimatedView>
    <ReanimatedView style={tw("pt-4")}>
      <FullWidthButton
        handlePress={_ => {
          setAskLocationPermission(_ => true)
        }}
        textColor="#5B6777"
        text="Deny"
        noBackgroundColor=true
      />
    </ReanimatedView>
  </ReanimatedView>
}
