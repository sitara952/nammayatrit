// open ReactNative
// open ReactNavigation

// open Style
// include MaterialTopTabs.Make()
// @send
// external toggleDrawer: (ReactNavigation.Core.navigation, unit) => unit = "toggleDrawer"

// @obj
// external options: (
//   ~title: string=?,
//   ~tabBarAccessibilityLabel: string=?,
//   ~tabBarTestID: string=?,
//   ~_lazy: bool=?,
//   ~swipeEnabled: bool=?,
//   ~tabBarActiveTintColor: string=?,
//   ~tabBarInactiveTintColor: string=?,
//   ~tabBarPressColor: string=?,
//   ~tabBarPressOpacity: float=?,
//   ~tabBarShowLabel: bool=?,
//   ~tabBarShowIcon: bool=?,
//   ~tabBarAllowFontScaling: bool=?,
//   ~tabBarBounces: bool=?,
//   ~tabBarScrollEnabled: bool=?,
//   ~tabBarIconStyle: ReactNative.Style.t=?,
//   ~tabBarLabelStyle: ReactNative.Style.t=?,
//   ~tabBarItemStyle: ReactNative.Style.t=?,
//   ~tabBarIndicatorStyle: ReactNative.Style.t=?,
//   ~tabBarIndicatorContainerStyle: ReactNative.Style.t=?,
//   ~tabBarContentContainerStyle: ReactNative.Style.t=?,
//   ~tabBarStyle: ReactNative.Style.t=?,
//   // ~renderIndicator: React.component({. "route": route})=?,
//   ~animationEnabled: bool=?,
//   unit,
// ) => MaterialTopTabs.options = ""

// module TopTabScreenWraper = {
//   @react.component
//   let make = (~children, ~setDynamicHeight, ~indexInFocus: int, ~index) => {
//     let dimensions = Dimensions.useWindowDimensions()
//     let (viewHeight, setViewHeight) = React.useState(_ => 0.)
//     let updateTabHeight = (event: Event.layoutEvent) => {
//       let nativeEvent = Event.LayoutEvent.nativeEvent(event)
//       let vheight =
//         nativeEvent
//         ->JSON.Decode.object
//         ->Option.getOr(Dict.empty())
//         ->Dict.get("layout")
//         ->Option.getOr(JSON.Encode.null)
//         ->JSON.Decode.object
//         ->Option.getOr(Dict.empty())
//         ->Dict.get("height")
//       switch vheight {
//       | Some(height) => {
//           let height = height->JSON.Decode.floatNumber->Option.getOr(0.)
//           setViewHeight(_ => height)
//         }
//       | None => ()
//       }
//     }

//     React.useEffect2(() => {
//       indexInFocus == index ? setDynamicHeight(Some(viewHeight)) : ()
//       None
//     }, (viewHeight, indexInFocus))
//     <View>
//       <View onLayout=updateTabHeight style={viewStyle(~width=dimensions.width->dp, ())}>
//         children
//       </View>
//     </View>
//   }
// }

// @react.component
// let make = (~hocComponentArr: array<PMListModifier.hoc>=[], ~setChildRef, ~loading=true) => {
//   //let (localSdkState, _) = React.useContext(SdkWrapper.sdkContext)
//   //let (nativeProp, _) = React.useContext(NativePropContext.nativePropContext)
//   let (indexInFocus, setIndexInFocus) = React.useState(_ => None)
//   let (heightPosition, _) = React.useState(_ => Animated.Value.create(0.))
//   let dimensions = Dimensions.useWindowDimensions()
//   let setDynamicHeight = (height: option<float>) => {
//     Animated.timing(
//       heightPosition,
//       Animated.Value.Timing.config(
//         ~toValue={
//           height->Option.getOr(0.)->Animated.Value.Timing.fromRawValue
//         },
//         ~isInteraction=true,
//         ~useNativeDriver=false,
//         ~delay=0.,
//         ~duration=130.,
//         ~easing=Easing.linear,
//         (),
//       ),
//     )->Animated.start()
//   }

//   let onViewableItemsChanged = React.useCallback0((
//     info: VirtualizedList.viewableItemsChanged<PMListModifier.hoc>,
//   ) => {
//     //Js.log2("changed", info.changed)
//     switch info.viewableItems->Array.get(0) {
//     | Some(val) =>
//       //   Js.log2("val", val)
//       setIndexInFocus(_ => Some(val.index->Js.Undefined.toOption->Option.getOr(0)))
//     | None => ()
//     }
//   })
//   let parentFlatlistRef = React.useRef(Nullable.null)
//   let scrollParentFL = indexToScroll => {
//     switch parentFlatlistRef.current->Nullable.toOption {
//     | Some(ref) => {
//         let flatlistParam = FlatList.scrollToIndexParams(
//           ~animated=true,
//           ~viewPosition=0.5,
//           ~index={indexToScroll},
//           (),
//         )
//         Js.log2("ref", ref)
//         ref->FlatList.scrollToIndex(flatlistParam)
//       }

//     | None => ()
//     }
//     ()
//   }
//   <View style={viewStyle(~minHeight=115.->dp, ~width=100.->pct, ~overflow=#hidden, ())}>
//     {switch indexInFocus {
//     | Some(val) => <ScrollableCustomTopBar hocComponentArr indexInFocus=val scrollParentFL />
//     | None => React.null
//     }}
//     <Animated.FlatList
//       ref={parentFlatlistRef->ReactNative.Ref.value}
//       data=hocComponentArr
//       horizontal=true
//       onViewableItemsChanged
//       //  viewabilityConfigCallbackPairs={[
//       //   VirtualizedList.viewabilityConfigCallbackPair(
//       //     ~viewabilityConfig={},
//       //     ~onViewableItemsChanged,
//       //   ),
//       // ]}
//       centerContent=true
//       style={viewStyle(
//         ~height=heightPosition->Animated.StyleProp.size,
//         //?tabPageHeight->Option.map(fl => (fl +. 80.)->dp),
//         (),
//       )}
//       snapToInterval=dimensions.width
//       scrollEnabled=true
//       contentInsetAdjustmentBehavior=#never
//       decelerationRate=#fast
//       onScrollToIndexFailed={_ => {Js.log("onScrollToIndexFailed")}}
//       snapToAlignment=#center
//       automaticallyAdjustContentInsets={false}
//       showsHorizontalScrollIndicator={false}
//       showsVerticalScrollIndicator={false}
//       scrollEventThrottle={1}
//       pagingEnabled={true}
//       keyExtractor={(_, val1) => val1->Int.toString}
//       renderItem={({item, index}) => {
//         <TopTabScreenWraper
//           setDynamicHeight indexInFocus={indexInFocus->Option.getOr(0)} index>
//           {item.componentHoc(
//             ~setChildRef,
//             ~isScreenFocus={indexInFocus->Option.getOr(0) == index},
//           )}
//         </TopTabScreenWraper>
//       }}
//     />
//   </View>
//   // <View style={viewStyle(~minHeight=115.->dp, ~width=100.->pct, ~flexWrap=#wrap, ())}>
//   //   {switch hocComponentArr->Array.length {
//   //   | 0 =>
//   //     loading
//   //       ? nativeProp.defaultView && localSdkState !== ConfirmCard
//   //           ? <View>
//   //               <Space height=20. />
//   //               {localSdkState != AddCard
//   //                 ? <View
//   //                     style={viewStyle(
//   //                       ~flexDirection=#row,
//   //                       ~width=100.->pct,
//   //                       ~height=75.->dp,
//   //                       ~marginHorizontal=18.->dp,
//   //                       (),
//   //                     )}>
//   //                     <ScrollableCustomTopBar.BottomTabList
//   //                       index=0 item={key: "0", name: "Card", params: ""} routeIndex=0
//   //                     />
//   //                     <ScrollableCustomTopBar.BottomTabList
//   //                       index=0 item={key: "1", name: "loading", params: ""} routeIndex=1
//   //                     />
//   //                     <ScrollableCustomTopBar.BottomTabList
//   //                       index=0 item={key: "2", name: "loading", params: ""} routeIndex=1
//   //                     />
//   //                   </View>
//   //                 : React.null}
//   //               <Card saveCardsData=None localSdkState cardVal=[] setChildRef />
//   //             </View>
//   //           : <View style={viewStyle(~marginHorizontal=18.->dp, ())}>
//   //               <Space height=20. />
//   //               <ShimmerView height="35" />
//   //               <Space height=4. />
//   //               <ShimmerView height="35" />
//   //               <Space />
//   //             </View>
//   //       : React.null
//   //   | _ =>
//   //     <Animated.FlatList
//   //       data=hocComponentArr
//   //       horizontal=true
//   //       //centerContent=true
//   //       nestedScrollEnabled=true
//   //       scrollEnabled=true
//   //       //onContentSizeChange
//   //       //contentContainerStyle={viewStyle(~width=100.->pct, ())}
//   //       // contentInsetAdjustmentBehavior=#scrollableAxes
//   //       // initialScrollIndex=3
//   //       // onScrollToIndexFailed={_ => {()}}
//   //       // style={viewStyle(
//   //       //   ~width=100.->pct,
//   //       //   ~height=//?tabPageHeight->Option.map(fl => (fl +. 80.)->dp),
//   //       //   heightPosition->Animated.StyleProp.size,
//   //       //   (),
//   //       // )}
//   //       // maintainVisibleContentPosition={{
//   //       //   minIndexForVisible: 0,
//   //       // }}
//   //       // contentInsetAdjustmentBehavior=#never
//   //       // snapToAlignment=#center
//   //       // decelerationRate=#fast
//   //       // automaticallyAdjustContentInsets={false}
//   //       // showsHorizontalScrollIndicator={false}
//   //       // showsVerticalScrollIndicator={false}
//   //       // scrollEventThrottle={1}
//   //       // alwaysBounceHorizontal=true
//   //       // pagingEnabled={true}
//   //       keyExtractor={(_, val1) => val1->Int.toString}
//   //       renderItem={({item, _}) => {
//   //         // <TopTabScreenWraper setDynamicHeight hocLength={hocComponentArr->Array.length}>
//   //         //   {item.componentHoc(~setChildRef)}
//   //         // </TopTabScreenWraper>
//   //         <View
//   //           style={viewStyle(
//   //             ~width=180.->dp,
//   //             ~height=40.->dp,
//   //             ~backgroundColor="red",
//   //             ~marginLeft=10.->dp,
//   //             (),
//   //           )}
//   //         />
//   //       }}
//   //     />
//   //   //  </Animated.View>
//   //   }}
//   // </View>
// }

