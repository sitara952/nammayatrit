open ReactNavigation
open ReactNative
open Style
open FirebaseFirestore
open Utils
open MessageView
open Tailwind
open! SuggestionPrediction
open Suggestions
open ThemebasedStyle
external asJson: _ => JSON.t = "%identity"

let defaultMsg = USER

let getMsgBy = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "Customer" => USER
    | "Driver" => DRIVER
    | _ => USER
    }
  })
  ->Option.getOr(defaultMsg)
}

let itemToObjectMapperMessageData = dict => {
  {
    message: getString(dict, "message", ""),
    timestamp: getString(dict, "timestamp", ""),
    sentBy: getMsgBy(dict, "sentBy"),
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route) => {
  let (closefunc, _) = React.useState(_ => false)
  let (rideFlowState, _rideFlowAction) = React.useContext(RideFlowContext.context)
  let (chat, setChat): (array<MessageView.messageData>, _) = React.useState(() => [])
  let (shouldAnimate, setShouldAnimate) = React.useState(_ => false)
  let flatlistRef = React.useRef(Nullable.null)
  let scrollToBottom = () => {
    switch flatlistRef.current->Nullable.toOption {
    | Some(ref) => ref->FlatList.scrollToEndWithOptions({animated: true})
    | None => ()
    }
  }
  let pickUpDistance: option<float> = switch route.params {
  | Some(a) => Some(Core.Params.unsafeGetValue(a)["pickUpDistance"])
  | None => None
  }
  let pickUpDistanceUnit: option<RouteAPI.distanceUnit> = switch route.params {
  | Some(a) => Some(Core.Params.unsafeGetValue(a)["pickUpDistanceUnit"])
  | None => None
  }

  let pickUpString = switch pickUpDistance {
  | Some(distance) =>
    switch pickUpDistanceUnit {
    | Some(RouteAPI.Mile) => distance->Float.toString ++ " Mile"
    | Some(RouteAPI.Meter) =>
      if distance >= 1000.0 {
        Float.toFixed(distance /. 1000.0, ~digits=1) ++ " km"
      } else {
        distance->Float.toString ++ " m"
      }
    | Some(_) => "0 mile"
    | None => "0 mile"
    }
  | None => "0 mile"
  }

  let driverDetail =
    rideFlowState
    ->asJson
    ->getDictFromJsonObject
    ->getJsonFromDict("rideDetail")
    ->getDictFromJsonObject
    ->getJsonFromDict("driverDetail")
    ->getDictFromJsonObject

  let firstName = driverDetail->getString("firstName", "")
  let getBppRideId =
    rideFlowState
    ->asJson
    ->getDictFromJsonObject
    ->getJsonFromDict("rideDetail")
    ->getDictFromJsonObject
    ->getString("bppRideId", "")

  React.useEffect1(() => {
    let unsubscribe =
      firestore()
      ->collection(~collectionPath="Chats")
      ->FirestoreCollection.doc(~documentPath=getBppRideId) //"000ce190-1359-457f-a3ff-47f3316b86cd")
      ->DocumentReference.collection(~collectionPath="messages")
      ->FirestoreCollection.orderBy("timestamp", Asc)
      ->Query.onSnapshot({
        next: Some(
          querySnapshot => {
            Console.log2("querySnapshot", querySnapshot)
            Console.log2("Metadata Changes -----------", querySnapshot.docs)
            let getData = querySnapshot.docs->Array.map(val => {
              val
              ->asJson
              ->getDictFromJson
              ->getJsonFromDict("_data")
              ->getDictFromJson
              ->itemToObjectMapperMessageData
            })
            setChat(v => {
              if Array.length(v) != 0 {
                setShouldAnimate(_ => true)
              }
              getData
            })
          },
        ),
        error: Some(
          error => {
            Console.log2("Error: ", error)
          },
        ),
        complete: None,
      })
    if closefunc {
      unsubscribe()
    }
    None
  }, [closefunc])

  let getMsgs = (rideId: string) => {
    firestore()
    ->collection(~collectionPath="Chats")
    ->FirestoreCollection.doc(~documentPath=rideId)
    ->DocumentReference.collection(~collectionPath="messages")
    ->FirestoreCollection.orderBy("timestamp", Asc)
    ->Query.get()
    ->Promise.thenResolve(querySnapshot => {
      Console.log2("Total users: ", querySnapshot.size)

      querySnapshot
      ->QuerySnapshot.forEach(documentSnapshot => {
        Console.log3(
          "User ID: ",
          documentSnapshot.id,
          documentSnapshot->QueryDocumentSnapshot.data(),
        )
      })
      ->ignore
      let getData = querySnapshot.docs->Array.map(val => {
        val
        ->asJson
        ->getDictFromJson
        ->getJsonFromDict("_data")
        ->getDictFromJson
        ->itemToObjectMapperMessageData
      })
      setChat(_ => {
        if Array.length(getData) == 0 {
          setShouldAnimate(_ => true)
        }
        getData
      })
    })
  }

  React.useEffect0(() => {
    let _ = getMsgs(getBppRideId) //("001dbbe5-ac59-4c61-b5a6-571f0c4dff29")
    None
  })

  let (modalState, setModalState, closeModal) = React.useContext(
    BottomSheetModalContext.modalContext,
  )

  let callDriverPopUp = {
    <CallDriverPopUp
      callDriverData={
        anonymousNmmber: switch rideFlowState.rideDetail {
        | Some(a) => Some(a.merchantExoPhone)
        | None => None
        },
        driectCallNumber: switch rideFlowState.rideDetail {
        | Some(a) => a.driverDetail.phoneNumber
        | None => None
        },
        onClosePress: closeModal,
      }
    />
  }

  let onPressCallDriver = {
    _ => {
      setModalState({
        ...modalState,
        modalComponent: Some(callDriverPopUp),
        backgroundClick: () => closeModal(),
      })
    }
  }

  let transformedChatSuggestions = (data: array<suggestionRecord>): array<
    TouchableTextWithIconList.tagConfig,
  > => {
    data->Array.map((item): TouchableTextWithIconList.tagConfig => {
      {
        text: item.message,
        componentType: {Light},
        paddingHorizontal: 10.->dp,
        paddingVertical: 6.->dp,
        id: item.key,
      }
    })
  }

  let arrLen = Array.length(chat)
  let lastMessage = chat[arrLen - 1]
  let arr = switch lastMessage {
  | Some(msg) => {
      msg.sentBy == DRIVER ? scrollToBottom() : ()
      msg.sentBy == DRIVER
        ? switch getSuggestionsFromKey(msg.message) {
          | Some(suggestions) => suggestions
          | None => getSuggestionsFromKey("customerDefaultBP")->Belt.Option.getWithDefault([])
          }
        : []
    }
  | None => getSuggestionsFromKey("customerInitialBP")->Belt.Option.getWithDefault([])
  }
  let messagesWithKeysObj = getMessagesWithKeysObj(arr)

  Js.log(transformedChatSuggestions)
  let transformedData = transformedChatSuggestions(messagesWithKeysObj)
  Console.log2("transformedData", transformedData)
  let (messageTxt, setMessageTxt) = React.useState(() => "")
  let textInputRef = React.useRef(Nullable.null)

  let sendMsg = (rideId: string, msgBdy: JSON.t) => {
    firestore()
    ->collection(~collectionPath="Chats")
    ->FirestoreCollection.doc(~documentPath=rideId)
    ->DocumentReference.collection(~collectionPath="messages")
    ->FirestoreCollection.add(~data=msgBdy)
    ->Promise.thenResolve(documentReference => {
      Console.log2("Total users: ", documentReference)
    })
    ->ignore
  }

  let sendMessage = (~suggestionMsg=?) => {
    setShouldAnimate(_ => true)
    let msgObj = {
      "message": switch suggestionMsg {
      | Some(suggestionMsg) => suggestionMsg
      | None => messageTxt
      },
      "sentBy": "USER",
      "timestamp": Js.Date.now(),
    }->asJson

    scrollToBottom()
    let cht = chat->Array.copy
    Array.push(cht, msgObj->getDictFromJson->itemToObjectMapperMessageData)
    sendMsg(getBppRideId, msgObj)
    setChat(_ => cht)
    setMessageTxt(_ => "")
  }

  let clearInput = () => {
    switch textInputRef.current->Nullable.toOption {
    | Some(ref) => ref->TextInput.clear
    | None => ()
    }
  }

  let handleOnSubmit = () => {
    sendMessage()
    clearInput()
  }
  let onBackPress = () => {
    Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
  }
  BackPress.hardwareBackPress(OnPress(onBackPress))
  <ScreenWrapperWithSafeArearViewAndPadding
    paddingHorizontal={0.->dp} backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite>
    <View
      style={viewStyle(
        ~flex=1.,
        ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
        ~justifyContent=#"flex-end",
        (),
      )}>
      <View
        style={viewStyle(
          ~flexDirection=#row,
          ~justifyContent=#"space-between",
          ~gap=10.,
          ~backgroundColor=ThemebasedStyle.colorClass.fillNeutralWhite,
          ~padding=16.->dp,
          ~alignItems=#center,
          (),
        )}>
        <View style={viewStyle(~flexDirection=#row, ~gap=10., ~alignItems=#center, ())}>
          <View
            style={viewStyle(
              ~marginTop=0.->dp,
              ~height=20.->dp,
              ~paddingHorizontal=4.->dp,
              ~paddingTop=20.->dp,
              ~paddingBottom=15.->dp,
              ~flexDirection=#row,
              ~justifyContent=#"space-between",
              ~alignItems=#center,
              (),
            )}>
            <TouchableOpacity
              style={viewStyle(
                ~height=32.->dp,
                ~width=32.->dp,
                ~alignItems=#"flex-start",
                ~justifyContent=#center,
                (),
              )}
              onPress={_ => onBackPress()}>
              <Svg.SvgXml xml=BackIcon.svg width={"32"} height={"32"} />
            </TouchableOpacity>
          </View>
          <View
            style={viewStyle(
              ~flexDirection=#row,
              ~marginRight=20.->dp,
              ~alignItems=#center,
              ~gap=13.,
              (),
            )}>
            <Svg.SvgXml xml=UserIcon.svg width={"46"} height={"46"} />
            <View style={viewStyle(~flexDirection=#column, ~gap=6., ())}>
              <TextWrapper
                text=CUSTOM_TEXT({text: firstName}) textType={SHead_700} color=colorClass.textBlack
              />
              <View
                style={tw(`items-center justify-center bg-fillPrimaryMid rounded-32 py-1 px-2`)}>
                <TextWrapper
                  text=CUSTOM_TEXT({
                    text: pickUpString ++ " away",
                  })
                  textType={SBody_600}
                  color=colorClass.textBlack
                />
              </View>
            </View>
          </View>
        </View>
        <View
          style={viewStyle(
            ~flexDirection=#column,
            ~backgroundColor=colorString.fillInfoHigh,
            ~borderRadius=19.,
            ~gap=10.,
            ~alignItems=#center,
            ~justifyContent=#center,
            ~paddingVertical=9.->dp,
            ~paddingHorizontal=19.->dp,
            (),
          )}>
          <View>
            <TouchableOpacity
              style={viewStyle(~alignItems=#"flex-start", ~justifyContent=#center, ())}
              onPress=onPressCallDriver>
              <Svg.SvgXml xml=Call.svgCallIcon width={"20"} height={"20"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <MessageViewList
        itemList=chat
        driverPillBgColor=colorString.fillInfoHigh
        driverPillTxtColor=colorClass.textWhite
        userPillBgColor=colorString.fillNeutralBlack
        userPillTxtColor=colorClass.textWhite
        reference={Some(flatlistRef->Ref.value)}
        shouldAnimate
      />
      <View
        style={tw(
          "px-4px pb-8px bg-fillNeutralLow " ++ {
            Array.length(transformedData) == 0 ? "h-0" : ""
          },
        )}>
        <TouchableTextWithIconList
          itemList=transformedData
          onPress=sendMessage
          backgroundColor=ThemebasedStyle.colorString.fillNeutralLow
          shadowIntensity=0.
          textType={SBody_600}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.os == #ios ? #padding : #height}
        enabled=true
        keyboardVerticalOffset={Platform.os == #ios ? 40. : 0.}
        contentContainerStyle={tw("flex-1")}>
        <CustomInput
          state=messageTxt
          setState={text => setMessageTxt(_ => text)}
          placeholder={CUSTOM_TEXT({
            text: GetLocale.getLocale(MESSAGE).text ++ " " ++ firstName,
          })}
          enableCrossIcon={false}
          paddingRight={10.->dp}
          paddingLeft={10.->dp}
          enableShadow=false
          backgroundColor=ThemebasedStyle.colorString.fillNeutralLow
          inputBoxBackgroundColor=ThemebasedStyle.colorString.fillNeutralWhite
          height=55.
          iconRight={CustomIcon(
            <View
              style={array([
                viewStyle(
                  ~flexDirection=#column,
                  ~backgroundColor=ThemebasedStyle.colorString.fillInfoHigh,
                  ~opacity=String.length(messageTxt) > 0 ? 1. : 0.7,
                  ~height=37.->dp,
                  ~width=48.->dp,
                  ~borderRadius=19.,
                  ~gap=10.,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                ),
              ])}>
              <TouchableOpacity
                onPress={_ => handleOnSubmit()}
                disabled={String.length(messageTxt) > 0 ? false : true}
                style={viewStyle(
                  ~width=100.0->pct,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  ~alignContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml=Send.svg height="100" />
              </TouchableOpacity>
            </View>,
          )}
          borderTopLeftRadius=24.
          borderTopRightRadius=24.
          borderBottomLeftRadius=24.
          borderBottomRightRadius=24.
          onFocus={() => ()}
          reference={Some(textInputRef->Ref.value)}
        />
        {Platform.os == #ios ? <Space height=10. /> : React.null}
      </KeyboardAvoidingView>
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
