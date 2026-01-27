open ReactNative
open Style

@react.component
let make = () => {
  let (modal, setModal) = React.useContext(ModalContext.modalContext)

  let currentModal = modal->Option.getOr({
    position: #"center-modal",
    modalscreen: React.null,
  })

  <View
    style={viewStyle(
      ~backgroundColor="transparent",
      ~alignItems=#center,
      ~justifyContent=#center,
      ~flex=1.,
      ~height=100.->pct,
      ~position=#absolute,
      ~width=100.->pct,
      (),
    )}>
    <TouchableOpacity
      onPress={_ => setModal(None)}
      style={viewStyle(
        ~backgroundColor="gray",
        ~opacity=0.5,
        ~flex=1.,
        ~height=100.->pct,
        ~width=100.->pct,
        (),
      )}
    />
    <View
      style={array([
        {viewStyle(~position=#absolute, ())},
        {
          switch currentModal.position {
          | #"bottom-modal" => viewStyle(~bottom=0.0->dp, ())
          | #"top-modal" => viewStyle(~top=0.0->dp, ())
          | _ => viewStyle()
          }
        },
      ])}>
      {currentModal.modalscreen}
    </View>
  </View>
}
