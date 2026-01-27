open ReactNative
open Style
open Tailwind
type searchInputType = {
  inputValue: option<string>,
  focused: bool,
  location: option<LocationTypes.location>,
  placeHolder: string,
  ref: React.ref<RescriptCore.Nullable.t<TextInput.element>>,
}

module TextInputListView = {
  @react.component
  let make = (
    ~item: searchInputType,
    ~onChange,
    ~dataLength,
    ~enableAddLocation=false,
    ~index,
    ~removeInput,
    ~addInput,
    ~onFocus,
    ~autoFocus,
    ~clearInput,
  ) => {
    let currentLocation = React.useContext(WatchUserLocationContext.context)
    let (rideFlowState, _) = React.useContext(RideFlowContext.context)
    let (firstRender, setFirstRender) = React.useState(_ => true)
    let selectAllOnFocus = () => {
      item.ref.current
      ->Nullable.toOption
      ->Utils.mapWithUnit(ref =>
        TextInput.setSelection(ref, String.length(item.inputValue->Option.getOr("")), 0)
      )
    }
    if firstRender {
      setTimeout(() => {
        item.ref.current
        ->Nullable.toOption
        ->Utils.mapWithUnit(ref =>
          item.focused ? selectAllOnFocus() : TextInput.setSelection(ref, 0, 0)
        )
      }, 100)->ignore
      setFirstRender(_ => false)
    }

    let (locationFetched, setLocationFetched) = React.useState(_ =>
      rideFlowState.currentLocation != None || index != 0
    )
    React.useEffect(_ => {
      if index == 0 {
        switch rideFlowState.currentLocation {
        | Some(_) => {
            setLocationFetched(_ => true)
            setFirstRender(_ => true)
          }
        | None => setLocationFetched(_ => false)
        }
      }
      None
    }, [rideFlowState.currentLocation])

    React.useEffect(() => {
      if locationFetched == false && index == 0 {
        currentLocation.positionErr->Utils.mapWithUnit(_ => {
          setLocationFetched(_ => true)
          ToastWrapper.myToast(
            ~message=CUSTOM_TEXT({text: "Unable to fetch your location"}),
            ~duration=5000,
            ~position=2,
          )
        })
      }
      None
    }, [currentLocation.positionErr])

    <View style={viewStyle(~position=#relative, ~flex=1., ())}>
      <CustomInput
        onFocus={() => {
          selectAllOnFocus()
          onFocus(index)
        }}
        onBlur={() =>
          item.ref.current
          ->Nullable.toOption
          ->Utils.mapWithUnit(ref => TextInput.setSelection(ref, 0, 0))}
        state={locationFetched ? item.inputValue->Option.getOr("") : "Loading..."}
        editable={locationFetched ? true : false}
        paddingHorizontal={6.->dp}
        textColor={locationFetched
          ? ThemebasedStyle.colorString.textBlack
          : ThemebasedStyle.colorString.textHigh}
        setState={onChange}
        borderTopWidth=0.
        autoFocus
        placeholder={CUSTOM_TEXT({text: {item.placeHolder}})}
        reference={Some(item.ref->ReactNative.Ref.value)}
        borderBottomWidth={dataLength == index + 1 ? 0. : 1.}
        borderLeftWidth=0.
        borderRightWidth=0.
        borderTopLeftRadius=0.
        borderTopRightRadius=0.
        borderBottomLeftRadius=0.
        borderBottomRightRadius=0.
        enableShadow=false
        clearButtonMode={#never}
        backgroundColor="transparent"
        paddingRight={0.->dp}
        paddingLeft={0.->dp}
        iconRight={String.length(item.inputValue->Option.getOr("")) > 0 ||
          (enableAddLocation && dataLength != index + 1 && index != 0)
          ? CustomIcon(
              <TouchableOpacity
                onPress={_ =>
                  index == 0 || dataLength == index + 1
                    ? {
                        clearInput(index)
                        onChange("")
                        Utils.mapWithUnit(item.ref.current->Nullable.toOption, TextInput.focus)
                      }
                    : removeInput(index)}
                style={viewStyle(
                  ~height=100.->pct,
                  ~width=20.->dp,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml={Close.svg("#7A8697")} />
              </TouchableOpacity>,
            )
          : NoIcon}
      />
      {enableAddLocation && dataLength == index + 1 && dataLength < 5
        ? <TouchableOpacity
            onPress={_ => addInput()}
            style={viewStyle(
              ~backgroundColor="white",
              ~borderWidth=1.,
              ~borderColor="lightgray",
              ~width=30.->dp,
              ~height=30.->dp,
              ~borderRadius=15.,
              ~position=#absolute,
              ~alignSelf=#"flex-end",
              ~alignItems=#center,
              ~justifyContent=#center,
              ~top=-15.->dp,
              (),
            )}>
            <TextWrapper
              text=CUSTOM_TEXT({text: "+", accessibilityHintOverride: "+"}) textType={SHead_700}
            />
          </TouchableOpacity>
        : React.null}
    </View>
  }
}

module Arrows = {
  @react.component
  let make = (~arrowLength) => {
    <View
      style={viewStyle(
        ~width=30.->dp,
        ~overflow=#hidden,
        ~height=arrowLength->Int.toFloat->dp,
        ~justifyContent=#center,
        ~alignItems=#center,
        ~paddingVertical=23.->dp,
        (),
      )}>
      // <Svg.SvgXml width="100%" height="100%" xml=CurvedArrow.svg />
      <Image
        source={Image.Source.fromRequired(
          Packager.require("../../../resources/assets/png/arrow.png"),
        )}
        style={imageStyle(~resizeMode=#stretch, ~width=100.->pct, ~height=100.->pct, ())}
      />
    </View>
  }
}

@react.component
let make = (~setSearchInputArray, ~searchInputArray, ~onFocus) => {
  let (rideSearchData, setRideSearchData) = React.useContext(RideSearchContext.rideSearchContext)
  let handleChange = index => newVal => {
    setSearchInputArray(prevArr => {
      prevArr->Array.mapWithIndex((val, currIndex) => {
        if currIndex === index {
          {
            inputValue: Some(newVal),
            focused: true,
            location: None,
            ref: val.ref,
            placeHolder: val.placeHolder,
          }
        } else {
          val
        }
      })
    })
  }
  let onFocus = index => {
    setRideSearchData({...rideSearchData, isPickup: index == 0})
    setSearchInputArray(prevArr => {
      prevArr->Array.mapWithIndex((val, currIndex) => {
        if currIndex === index {
          onFocus(index)
          {
            inputValue: val.inputValue,
            focused: true,
            location: val.location,
            ref: val.ref,
            placeHolder: val.placeHolder,
          }
        } else {
          {
            inputValue: val.inputValue,
            focused: false,
            location: val.location,
            ref: val.ref,
            placeHolder: val.placeHolder,
          }
        }
      })
    })
  }
  let clearInput = index => {
    index == 0
      ? setRideSearchData({...rideSearchData, sourceSetUsingPin: false})
      : setRideSearchData({...rideSearchData, destSet: false, destination: None})
    setSearchInputArray(prevArr => {
      prevArr->Array.mapWithIndex((val, currIndex) => {
        if currIndex === index {
          {
            inputValue: None,
            focused: false,
            location: None,
            ref: val.ref,
            placeHolder: val.placeHolder,
          }
        } else {
          {
            inputValue: val.inputValue,
            focused: false,
            location: val.location,
            ref: val.ref,
            placeHolder: val.placeHolder,
          }
        }
      })
    })
  }
  let removeInput = index => {
    setSearchInputArray(prevArr => {
      prevArr->Array.filterWithIndex((_, i) => index != i)
    })
  }
  let addInput = () => {
    setSearchInputArray(prevArr => {
      let updatedSearchInputArray = prevArr->Array.copy
      updatedSearchInputArray->Array.push({
        inputValue: None,
        focused: true,
        location: None,
        ref: React.createRef(),
        placeHolder: "Enter Stop Location",
      })
      updatedSearchInputArray
    })
  }

  let arrowHeight = (searchInputArray->Array.length * 47)->Int.toString

  <View
    style={array([
      viewStyle(
        ~flexDirection=#row,
        ~borderColor=ThemebasedStyle.colorString.borderNeutralBlack,
        ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
        ~borderRadius=18.,
        ~width=100.->pct,
        ~borderWidth=1.,
        ~alignItems=#center,
        (),
      ),
    ])}>
    <View style={tw(`w-30px h-${arrowHeight}px justify-center items-end pt-2px`)}>
      <Svg.SvgXml xml=CurvedSearchArrow.svg />
    </View>
    <View style={viewStyle(~flex=1., ~overflow=#hidden, ~borderRadius=8., ())}>
      {searchInputArray
      ->Array.mapWithIndex((item, index) => {
        <TextInputListView
          dataLength={searchInputArray->Array.length}
          index
          key={index->Int.toString}
          item
          onChange={handleChange(index)}
          removeInput
          addInput
          onFocus
          autoFocus={item.focused}
          clearInput
        />
      })
      ->React.array}
    </View>
  </View>
}
