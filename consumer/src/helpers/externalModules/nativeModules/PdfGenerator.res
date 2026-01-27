// @scope(("NativeModules", "PdfGeneratorModule")) @module("react-native")
// external generatePDF: int => Promise.t<string> = "generatePDF"

type option = {
  html: string,
  fileName?: string,
  base64: bool,
  directory?: string,
  height?: float,
  width?: float,
}

@scope(("NativeModules", "RNHTMLtoPDF")) @module("react-native")
external convert: option => Promise.t<string> = "convert"
