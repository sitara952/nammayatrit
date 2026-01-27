require 'nanaimo'
require 'cfpropertylist'
require 'fileutils'

def convert_plist_to_binary(path)
  file = File.read(path)
  IO.popen('plutil -convert binary1 -r -o - -- -', 'r+') {|f|
  f.write(file)
  f.close_write
  File.write(path,f.read)
  }
  end
def parse_plist(content)
  case Nanaimo::Reader.plist_type(content)
  when :xml, :binary
    CFPropertyList.native_types(CFPropertyList::List.new(:data => content).value)
  else
    Nanaimo::Reader.new(content).parse!.as_ruby
  end
end

def write_file_to_path(hash,path)
  if hash.respond_to?(:to_hash)
    hash = hash.to_hash
  else
    raise TypeError, "The given `#{hash.inspect}` must respond " \
                      "to #to_hash'."
  end

  unless path.is_a?(String) || path.is_a?(Pathname)
    raise TypeError, "The given `#{path}` must be a string or 'pathname'."
  end
  path = path.to_s
  raise IOError, 'Empty path.' if path.empty?

  File.open(path, 'w') do |f|
    plist = Nanaimo::Plist.new(hash, :xml)
    Nanaimo::Writer::XMLWriter.new(plist, :pretty => true, :output => f, :strict => false).write
  end
end

def update_local_assets(path)
  info_plist = File.read(path)
  IO.popen('plutil -convert xml1 -r -o - -- -', 'r+') {|f|
    f.write(info_plist)
    f.close_write
    info_plist = f.read
    parsed_plist = parse_plist(info_plist)
    parsed_plist["local_assets"] = ARGV.length > 0 && ARGV[0] == "true"
    write_file_to_path(parsed_plist,path)
    convert_plist_to_binary(path)
  }
end

xc_framework_path = "./Pods/HyperSDK/HyperSDK.xcframework"
hyper_sdk_iphone_framework_path = xc_framework_path + "/ios-arm64/HyperSDK.framework/Info.plist"
hyper_sdk_simulator_framework_path = xc_framework_path + "/ios-arm64_x86_64-simulator/HyperSDK.framework/Info.plist"

FileUtils.rm_rf(Dir[ "./Pods/HyperSDK/HyperSDK.xcframework/*/*/juspay_assets.json" ])
FileUtils.rm_rf(Dir[ "./Pods/HyperSDK/HyperSDK.xcframework/*/*/config.json" ])
update_local_assets(hyper_sdk_iphone_framework_path)
update_local_assets(hyper_sdk_simulator_framework_path)
FileUtils.cp_r("./sdk_config.json","./Pods/HyperSDK/HyperSDK.xcframework/ios-arm64/HyperSDK.framework/")
FileUtils.cp_r("./sdk_config.json","./Pods/HyperSDK/HyperSDK.xcframework/ios-arm64_x86_64-simulator/HyperSDK.framework/")
