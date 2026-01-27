open! AnimatedListItem
open ReactNative
open Style

module EditButton = {
  @react.component
  let make = () => {
    <View
      style={viewStyle(
        ~backgroundColor=ThemebasedStyle.colorString.fillInfoHigh,
        ~paddingHorizontal=14.->dp,
        ~paddingVertical=6.->dp,
        ~borderRadius=16.,
        (),
      )}>
      <TextWrapper overRideStyle={textStyle(~color="white", ())} textType={SBody_600} text={EDIT} />
    </View>
  }
}
let renderSpecialLocationComponent = (
  selectedGateId: option<string>,
  setSelectedGateId: (option<string> => option<string>) => unit,
  locationList: array<LocationTypes.location>,
) => {
  <>
    <TextWrapper
      text={SPECIAL_LOCATION_GATE}
      textType={SBody_400}
      overRideStyle={textStyle(
        ~width=100.0->pct,
        ~color=ThemebasedStyle.colorString.fillNeutralBlack,
        ~textAlign=#left,
        (),
      )}
    />
    <ScrollWheelList
      items={locationList->Array.mapWithIndex((location, idx) => {
        heading: Option.getOr(location.title, ""),
        subHeading: Option.getOr(location.subtitle, ""),
        index: idx,
        id: Option.getOr(location.placeId, ""),
        active: switch selectedGateId {
        | Some(gateId) => Option.getOr(location.placeId, "") == gateId
        | None => false
        },
      })}
      setSelectedItemId=setSelectedGateId
    />
  </>
}

let renderSearchListItem = (
  onPress: LocationTypes.location => unit,
  source: option<LocationTypes.location>,
) => {
  switch source {
  | Some(source) =>
    <SearchListItem
      onPress
      heading=source.title
      subHeading=source.subtitle
      prefixImage=""
      borderRadius=12.
      paddingHorizontal={16.->dp}
      paddingVertical={14.->dp}
      postfixViewType={CustomIcon(<EditButton />)}
      postfixText=""
      postfixViewAlignment=#center
      borderConfig={top: 0., bottom: 0., left: 0., right: 0.}
      marginConfig={top: 10., bottom: 24., left: 0., right: 0.}
      location=Some(source)
    />
  | None => React.null
  }
}

let renderListItem = (
  locationList: array<LocationTypes.location>,
  onPress: LocationTypes.location => unit,
  selectedGateId: option<string>,
  setSelectedGateId: (option<string> => option<string>) => unit,
) => {
  switch locationList->Array.length {
  | 0 => React.null
  | 1 => renderSearchListItem(onPress, locationList->Array.get(0))
  | _ => renderSpecialLocationComponent(selectedGateId, setSelectedGateId, locationList)
  }
}
