open ReactNativeFs

type transportOptions = {
  fileName: option<string>,
  filePath: option<string>,
}

type transportProps = {
  msg: string,
  options: option<transportOptions>,
}

type transportFunctionType = transportProps => Promise.t<bool>
let staticLogFileName = "app.log"

let getFormattedDate = () => {
  let today = Js.Date.make()
  let d = Js.Date.getDate(today)->Int.fromFloat->Int.toString
  let m = Js.Date.getMonth(today)->Int.fromFloat->(m => m + 1)->Int.toString
  let y = Js.Date.getFullYear(today)->Int.fromFloat->Int.toString
  `${d}-${m}-${y}`
}
let fileTransport = (
  level: LoggerTypes.level,
  message: string,
  transportOptions: LoggerTypes.transportOptions,
) => {
  let writeLogs: transportFunctionType = props => {
    switch props.options {
    | None => Promise.resolve(false)
    | Some(options) =>
      let filePath = switch options.filePath {
      | Some(path) => path
      | None => documentDirectoryPath
      }
      let fileName = switch options.fileName {
      | Some(name) => name
      | None => "app.log"
      }
      let path = `${filePath}/${fileName}`
      let output = `${props.msg}\n`

      appendFile(path, output, None)
      ->Promise.then(() => Promise.resolve(true))
      ->Promise.catch(error => {
        Console.log(error)
        Promise.resolve(false)
      })
    }
  }
  let fileTransportProps = {
    msg: message,
    options: Some({
      fileName: Some(staticLogFileName),
      filePath: None,
    }),
  }
  Console.log("zxc fileTransport")
  writeLogs(fileTransportProps)->ignore
}
