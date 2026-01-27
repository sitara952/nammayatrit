open ReactNative
open Style
open ReactNavigation
open Native

@react.component
let make = (
  ~bgColor="#823EFB",
  ~color="#FFFFFF",
  ~seconds: int,
  ~countDown=false,
  ~countUp=false,
) => {
  let (second, setSecond) = React.useState(_ => seconds)
  let refTimerId = React.useRef(None)
  let isFocused = useIsFocused()
  let styles = {
    "parent": textStyle(
      ~color,
      ~fontWeight=#600,
      ~fontSize=17.,
      ~paddingVertical=2.->dp,
      ~paddingHorizontal=10.->dp,
      ~backgroundColor=bgColor,
      ~alignSelf=#center,
      ~borderRadius=30.,
      (),
    ),
  }
  let fetchTime = (seconds': int) => {
    if seconds' / 3600 >= 1 {
      Int.toString(seconds' / 3600) ++ " " ++ "hour"
    } else if seconds' / 60 >= 1 {
      Int.toString(seconds' / 60) ++ " " ++ "min"
    } else {
      Int.toString(seconds') ++ " " ++ "sec"
    }
  }

  let cleanUpTasks = () => {
    Some(
      () => {
        Console.log("stop timer")
        switch refTimerId.current {
        | Some(timerId) => Js.Global.clearInterval(timerId)
        | None => ()
        }
      },
    )
  }

  React.useEffect1(() => {
    if countDown || countUp {
      let timerId = setInterval(() => {
        setSecond(
          second' =>
            if second' > 0 && countDown && isFocused {
              second' - 1
            } else if countUp && isFocused {
              Console.log("timer")
              second' + 1
            } else {
              switch refTimerId.current {
              | Some(timerId) => Js.Global.clearInterval(timerId)
              | None => ()
              }
              0
            },
        )
      }, 1000)
      refTimerId.current = Some(timerId)
      cleanUpTasks()
    } else {
      None
    }
  }, [isFocused])

  <Text style={styles["parent"]}> {React.string(fetchTime(second))} </Text>
}
