// React Native FileSystem (RNFS) bindings for ReScript

// Type definitions
type mkdirOptions = {
  nsUrlIsExcludedFromBackupKey?: bool, // iOS only
  nsFileProtectionKey?: string, // iOS only
}

type fileOptions = {nsFileProtectionKey?: string} // iOS only

type readDirItem = {
  ctime: option<Js.Date.t>, // The creation date of the file (iOS only)
  mtime: option<Js.Date.t>, // The last modified date of the file
  name: string, // The name of the item
  path: string, // The absolute path to the item
  size: float, // Size in bytes
  isFile: unit => bool, // Is the file just a file?
  isDirectory: unit => bool, // Is the file a directory?
}

type statResult = {
  name: option<string>, // The name of the item
  path: string, // The absolute path to the item
  size: float, // Size in bytes
  mode: int, // UNIX file mode
  ctime: float, // Created date
  mtime: float, // Last modified date
  originalFilepath: string, // In case of content uri this is the pointed file path, otherwise is the same as path
  isFile: unit => bool, // Is the file just a file?
  isDirectory: unit => bool, // Is the file a directory?
}

type headers = Js.Dict.t<string>
type fields = Js.Dict.t<string>

type rec downloadBeginCallbackResult = {
  jobId: int, // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  statusCode: int, // The HTTP status code
  contentLength: float, // The total size in bytes of the download resource
  headers: headers, // The HTTP response headers from the server
}

and downloadProgressCallbackResult = {
  jobId: int, // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  contentLength: float, // The total size in bytes of the download resource
  bytesWritten: float, // The number of bytes written to the file so far
}

and downloadFileOptions = {
  fromUrl: string, // URL to download file from
  toFile: string, // Local filesystem path to save the file to
  headers?: headers, // An object of headers to be passed to the server
  background?: bool, // Continue the download in the background after the app terminates (iOS only)
  discretionary?: bool, // Allow the OS to control the timing and speed of the download to improve perceived performance (iOS only)
  cacheable?: bool, // Whether the download can be stored in the shared NSURLCache (iOS only)
  progressInterval?: float,
  progressDivider?: float,
  begin?: downloadBeginCallbackResult => unit,
  progress?: downloadProgressCallbackResult => unit,
  resumable?: unit => unit, // only supported on iOS yet
  connectionTimeout?: float, // only supported on Android yet
  readTimeout?: float, // supported on Android and iOS
  backgroundTimeout?: float, // Maximum time (in milliseconds) to download an entire resource (iOS only, useful for timing out background downloads)
}

type downloadResult = {
  jobId: int, // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  statusCode: int, // The HTTP status code
  bytesWritten: float, // The number of bytes written to the file
}

type rec uploadBeginCallbackResult = {jobId: int} // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.

and uploadProgressCallbackResult = {
  jobId: int, // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.
  totalBytesExpectedToSend: float, // The total number of bytes that will be sent to the server
  totalBytesSent: float, // The number of bytes sent to the server
}

and uploadFileItem = {
  name?: string, // Name of the file, if not defined then filename is used
  filename: string, // Name of file
  filepath: string, // Path to file
  filetype: string, // The mimetype of the file to be uploaded, if not defined it will get mimetype from `filepath` extension
}

and uploadFileOptions = {
  toUrl: string, // URL to upload file to
  binaryStreamOnly?: bool, // Allow for binary data stream for file to be uploaded without extra headers, Default is 'false'
  files: array<uploadFileItem>, // An array of objects with the file information to be uploaded.
  headers?: headers, // An object of headers to be passed to the server
  fields?: fields, // An object of fields to be passed to the server
  method?: string, // Default is 'POST', supports 'POST' and 'PUT'
  begin?: uploadBeginCallbackResult => unit,
  progress?: uploadProgressCallbackResult => unit,
}

type uploadResult = {
  jobId: int, // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.
  statusCode: int, // The HTTP status code
  headers: headers, // The HTTP response headers from the server
  body: string, // The HTTP response body
}

type fsInfoResult = {
  totalSpace: float, // The total amount of storage space on the device (in bytes).
  freeSpace: float, // The amount of available storage space on the device (in bytes).
}

// New type definitions for downloadFile and uploadFiles return values
type downloadFileResult = {
  jobId: int,
  promise: Promise.t<downloadResult>,
}

type uploadFilesResult = {
  jobId: int,
  promise: Promise.t<uploadResult>,
}

// Bindings to the RNFS module
@module("react-native-fs")
external mkdir: (string, option<mkdirOptions>) => Promise.t<unit> = "mkdir"
@module("react-native-fs")
external moveFile: (string, string, option<fileOptions>) => Promise.t<unit> = "moveFile"
@module("react-native-fs")
external copyFile: (string, string, option<fileOptions>) => Promise.t<unit> = "copyFile"
@module("react-native-fs") external pathForBundle: string => Promise.t<string> = "pathForBundle"
@module("react-native-fs") external pathForGroup: string => Promise.t<string> = "pathForGroup"
@module("react-native-fs") external getFSInfo: unit => Promise.t<fsInfoResult> = "getFSInfo"
@module("react-native-fs")
external getAllExternalFilesDirs: unit => Promise.t<array<string>> = "getAllExternalFilesDirs"
@module("react-native-fs") external unlink: string => Promise.t<unit> = "unlink"
@module("react-native-fs") external exists: string => Promise.t<bool> = "exists"
@module("react-native-fs") external stopDownload: int => unit = "stopDownload"
@module("react-native-fs") external resumeDownload: int => unit = "resumeDownload"
@module("react-native-fs") external isResumable: int => Promise.t<bool> = "isResumable"
@module("react-native-fs") external stopUpload: int => unit = "stopUpload"
@module("react-native-fs") external completeHandlerIOS: int => unit = "completeHandlerIOS"
@module("react-native-fs") external readDir: string => Promise.t<array<readDirItem>> = "readDir"
@module("react-native-fs") external scanFile: string => Promise.t<array<string>> = "scanFile"
@module("react-native-fs")
external readDirAssets: string => Promise.t<array<readDirItem>> = "readDirAssets"
@module("react-native-fs") external existsAssets: string => Promise.t<bool> = "existsAssets"
@module("react-native-fs") external existsRes: string => Promise.t<bool> = "existsRes"
@module("react-native-fs") external readdir: string => Promise.t<array<string>> = "readdir"
@module("react-native-fs")
external setReadable: (string, bool, bool) => Promise.t<bool> = "setReadable"
@module("react-native-fs") external stat: string => Promise.t<statResult> = "stat"
@module("react-native-fs") external readFile: (string, option<'a>) => Promise.t<string> = "readFile"
@module("react-native-fs")
external read: (string, option<int>, option<int>, option<'a>) => Promise.t<string> = "read"
@module("react-native-fs")
external readFileAssets: (string, option<'a>) => Promise.t<string> = "readFileAssets"
@module("react-native-fs")
external readFileRes: (string, option<'a>) => Promise.t<string> = "readFileRes"
@module("react-native-fs") external hash: (string, string) => Promise.t<string> = "hash"
@module("react-native-fs")
external copyFileAssets: (string, string) => Promise.t<unit> = "copyFileAssets"
@module("react-native-fs") external copyFileRes: (string, string) => Promise.t<unit> = "copyFileRes"
@module("react-native-fs")
external copyAssetsFileIOS: (
  string,
  string,
  int,
  int,
  option<float>,
  option<float>,
  option<string>,
) => Promise.t<string> = "copyAssetsFileIOS"
@module("react-native-fs")
external copyAssetsVideoIOS: (string, string) => Promise.t<string> = "copyAssetsVideoIOS"
@module("react-native-fs")
external writeFile: (string, string, option<'a>) => Promise.t<unit> = "writeFile"
@module("react-native-fs")
external appendFile: (string, string, option<string>) => Promise.t<unit> = "appendFile"
@module("react-native-fs")
external write: (string, string, option<int>, option<'a>) => Promise.t<unit> = "write"
@module("react-native-fs")
external downloadFile: downloadFileOptions => downloadFileResult = "downloadFile"
@module("react-native-fs")
external uploadFiles: uploadFileOptions => uploadFilesResult = "uploadFiles"
@module("react-native-fs")
external touch: (string, option<Js.Date.t>, option<Js.Date.t>) => Promise.t<unit> = "touch"

// Constants
@module("react-native-fs") external mainBundlePath: string = "MainBundlePath"
@module("react-native-fs") external cachesDirectoryPath: string = "CachesDirectoryPath"
@module("react-native-fs")
external externalCachesDirectoryPath: string = "ExternalCachesDirectoryPath"
@module("react-native-fs") external downloadDirectoryPath: string = "DownloadDirectoryPath"
@module("react-native-fs") external documentDirectoryPath: string = "DocumentDirectoryPath"
@module("react-native-fs") external externalDirectoryPath: string = "ExternalDirectoryPath"
@module("react-native-fs")
external externalStorageDirectoryPath: string = "ExternalStorageDirectoryPath"
@module("react-native-fs") external temporaryDirectoryPath: string = "TemporaryDirectoryPath"
@module("react-native-fs") external libraryDirectoryPath: string = "LibraryDirectoryPath"
@module("react-native-fs") external picturesDirectoryPath: string = "PicturesDirectoryPath"
@module("react-native-fs") external fileProtectionKeys: string = "FileProtectionKeys"
