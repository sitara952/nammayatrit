open Reanimated
open ReactNative
open Style
open Gradient
open AnimatedListItem

@react.component
let make = (
  ~items: array<item>,
  ~setSelectedItemId: (option<string> => option<string>) => unit,
) => {
  let cardHeight = 60
  let cardVerticalSpacing = 5
  let scrollViewHeight = Int.toFloat(cardHeight * 3 + cardVerticalSpacing * 6)
  let snapFactor = Js.Int.toFloat(cardHeight + cardVerticalSpacing * 2)

  let viewableItems: Reanimated.SharedValue.t<
    option<array<VirtualizedList.viewableItem<item>>>,
  > = useSharedValue(None)

  let scrollOffsetY = useSharedValue(0.)

  let flatListRef = React.useRef(Nullable.null)

  <View style={viewStyle(~flex=1., ~height=scrollViewHeight->dp, ())}>
    <GestureHandler.GestureHandlerFlatList
      data={items}
      ref={flatListRef->ReactNative.Ref.value}
      style={viewStyle(~flex=1., ())}
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false
      snapToInterval=snapFactor
      snapToAlignment={#start}
      decelerationRate={#normal}
      onViewableItemsChanged={({viewableItems: vItems}) => {
        viewableItems.value = Some(vItems)
      }}
      keyExtractor={(_, i) => i->Int.toString}
      horizontal=false
      renderItem={({item, index}) =>
        <AnimatedListItem
          item
          index
          lastItemIndex={Array.length(items) - 1}
          cardHeight
          cardVerticalSpacing
          snapFactor
          scrollOffsetY
        />}
    />
    <View
      style={viewStyle(
        ~position=#absolute,
        ~top=0.->dp,
        ~height=Int.toFloat(cardHeight + cardVerticalSpacing)->dp,
        ~width=100.->pct,
        ~alignSelf=#center,
        (),
      )}
      pointerEvents={#none}>
      <LinearGradient
        colors={["rgba(224,209,255, 1)", "rgba(224,209,255, 0)"]}
        start={{x: 0.5, y: 0.}}
        end={{x: 0.5, y: 1.}}
      />
    </View>
    <View
      style={viewStyle(
        ~position=#absolute,
        ~bottom=0.->dp,
        ~height=Int.toFloat(cardHeight + cardVerticalSpacing)->dp,
        ~width=100.->pct,
        ~alignSelf=#center,
        (),
      )}
      pointerEvents={#none}>
      <LinearGradient
        colors={["rgba(224,209,255, 1)", "rgba(224,209,255, 0)"]}
        start={{x: 0.5, y: 1.}}
        end={{x: 0.5, y: 0.}}
      />
    </View>
  </View>
}
