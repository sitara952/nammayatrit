open ReactNative
open Style

@react.component
let make = (
  ~itemList: array<MessageView.messageData>,
  ~userPillBgColor=ThemebasedStyle.colorString.fillInfoHigh,
  ~driverPillBgColor=ThemebasedStyle.colorString.fillNeutralBlack,
  ~userPillTxtColor=ThemebasedStyle.colorString.textWhite,
  ~driverPillTxtColor=ThemebasedStyle.colorString.textBlack,
  ~reference=None,
  ~shouldAnimate,
) => {
  <View
    style={viewStyle(
      ~overflow=#hidden,
      ~flexDirection=#column,
      ~flex=1.,
      ~justifyContent=#"flex-end",
      ~backgroundColor=ThemebasedStyle.colorString.fillNeutralLow,
      ~paddingHorizontal=4.->dp,
      (),
    )}>
    <FlatList
      inverted=true
      showsHorizontalScrollIndicator=false
      scrollEnabled=true
      keyExtractor={(_, i) => i->Int.toString}
      data=itemList
      ref=?reference
      contentContainerStyle={viewStyle(
        ~flexGrow=1.,
        ~justifyContent=#"flex-end",
        ~flexDirection=#"column-reverse",
        (),
      )}
      renderItem={({item}) => <>
        <View
          style={viewStyle(
            ~paddingLeft={item.sentBy == USER ? 50.->dp : 0.->dp},
            ~paddingRight={item.sentBy == USER ? 0.->dp : 50.->dp},
            (),
          )}>
          <MessageView
            item
            backgroundColor={item.sentBy == USER ? userPillBgColor : driverPillBgColor}
            alignSelf={item.sentBy == USER ? #"flex-end" : #"flex-start"}
            borderTopRightRadius={item.sentBy == USER ? 0. : 16.}
            borderTopLeftRadius={item.sentBy == USER ? 16. : 0.}
            textcolor={item.sentBy == USER ? userPillTxtColor : driverPillTxtColor}
            shouldAnimate
          />
        </View>
        <Space height=10. />
      </>}
    />
    <Space height=10. />
  </View>
}
