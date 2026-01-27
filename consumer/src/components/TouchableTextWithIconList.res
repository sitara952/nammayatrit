open ReactNative
open Style

type tagConfig = {
  text: string,
  prefixImg?: string,
  id?: string,
  componentType: TouchableTextWithIcon.componentType,
  paddingHorizontal: ReactNative.Style.size,
  paddingVertical: ReactNative.Style.size,
}

@react.component
let make = (
  ~itemList: array<tagConfig>,
  ~onPress: (~suggestionMsg: string=?) => unit,
  ~backgroundColor=ThemebasedStyle.colorString.fillNeutralLow,
  ~shadowIntensity=2.,
  ~textType=TextWrapper.Body_700,
) => {
  <View style={viewStyle(~overflow=#hidden, ~backgroundColor, ())}>
    <FlatList
      horizontal=true
      showsHorizontalScrollIndicator=false
      scrollEnabled=true
      keyExtractor={(_, i) => i->Int.toString}
      data=itemList
      keyboardShouldPersistTaps={#always}
      renderItem={({item}) => <>
        <TouchableTextWithIcon
          onPress={_ => onPress(~suggestionMsg=item.id->Option.getOr(""))}
          text={item.text}
          icon={item.prefixImg}
          componentType={item.componentType}
          shadowIntensity
          textType
        />
        <Space width=6. />
      </>}
    />
  </View>
}
