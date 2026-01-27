open ReactNative
open Style
open Reanimated
open Tailwind

@react.component
let make = (~loading) => {
  <ReanimatedView>
    <ReanimatedView style={tw("pt-3 px-4")} entering=Reanimated.fadeIn>
      <ReanimatedView
        style={array([
          tw(
            "py-4 border-[1px] border-[#EBEBEE] rounded-[14px] bg-white flex flex-row items-center pl-3 pr-4",
          ),
        ])}>
        <ReanimatedView style={tw("h-12 w-12 justify-center items-center")}>
          <ShimmerView
            bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=loading height="48" width="48"
          />
        </ReanimatedView>
        <ReanimatedView style={tw("pl-2.5")}>
          {<>
            <ShimmerView
              bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=loading height="18" width="175"
            />
            <ReanimatedView style={tw("pt-2")}>
              <ShimmerView
                bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=loading height="15" width="100"
              />
            </ReanimatedView>
          </>}
        </ReanimatedView>
      </ReanimatedView>
    </ReanimatedView>
  </ReanimatedView>
}
