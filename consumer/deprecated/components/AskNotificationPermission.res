open Reanimated
open Tailwind

module NotificationPinIcon = {
  @react.component
  let make = () => {
    <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <Svg.Path
        d="M20.757 40.0595C21.7984 39.8391 28.1447 39.8391 29.1861 40.0595C30.0765 40.2651 31.0393 40.7456 31.0393 41.7947C30.9875 42.7935 30.4016 43.6789 29.592 44.2413C28.5422 45.0596 27.3102 45.5779 26.0224 45.7646C25.3101 45.8569 24.6102 45.859 23.9228 45.7646C22.6329 45.5779 21.4009 45.0596 20.3532 44.2392C19.5415 43.6789 18.9556 42.7935 18.9038 41.7947C18.9038 40.7456 19.8666 40.2651 20.757 40.0595ZM25.0945 4.16797C29.4282 4.16797 33.855 6.22426 36.4846 9.63602C38.1907 11.8329 38.9734 14.0277 38.9734 17.4394V18.327C38.9734 20.9435 39.665 22.4857 41.1868 24.263C42.3401 25.5723 42.7087 27.253 42.7087 29.0763C42.7087 30.8976 42.1103 32.6266 40.9114 34.0303C39.342 35.7131 37.1285 36.7874 34.8696 36.9742C31.5961 37.2532 28.3204 37.4883 25.0014 37.4883C21.6802 37.4883 18.4067 37.3477 15.1331 36.9742C12.8721 36.7874 10.6587 35.7131 9.0913 34.0303C7.89245 32.6266 7.29199 30.8976 7.29199 29.0763C7.29199 27.253 7.66262 25.5723 8.81384 24.263C10.3833 22.4857 11.0293 20.9435 11.0293 18.327V17.4394C11.0293 13.9353 11.9031 11.644 13.7024 9.40102C16.3775 6.12984 20.6656 4.16797 24.9082 4.16797H25.0945Z"
        fill="#7D4BFF"
      />
    </Svg>
  }
}

@react.component
let make = () => {
  <ReanimatedView style={tw("bg-white flex-1 pt-5 px-4")}>
    <TextWrapper
      text={NOTIFICATION_ACCESS_HEADER}
      overRideStyle={tw("text-[#14171F] py-1.5 pb-4")}
      textType={Head_800}
    />
    <ReanimatedView style={tw("h-[1px] bg-fillNeutralMid")} />
    <ReanimatedView style={tw("flex flex-row justify-between items-center pt-4")}>
      <TextWrapper
        text={NOTIFICATION_ACCESS_INFO}
        overRideStyle={tw("text-textHigh max-w-3/4")}
        textType={Body_600}
      />
      <NotificationPinIcon />
    </ReanimatedView>
    <ReanimatedView style={tw("pt-6")}>
      <FullWidthButton text="Allow" />
    </ReanimatedView>
    <ReanimatedView style={tw("pt-4")}>
      <FullWidthButton textColor="#5B6777" text="Deny" noBackgroundColor=true />
    </ReanimatedView>
  </ReanimatedView>
}
