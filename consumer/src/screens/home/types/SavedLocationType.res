open LocationTypes

@genType
type savedLocTag = FAV(string) | ADD_HOME | ADD_WORK

@genType
type savedLocType = {
  tag: savedLocTag,
  locationData: option<location>,
}

@genType
type tagConfig = {
  text: string,
  prefixImg: string,
  componentType: TouchableTextWithIcon.componentType,
  paddingHorizontal: string,
  paddingVertical: string,
  tag: savedLocTag,
  locationData: option<location>,
}
