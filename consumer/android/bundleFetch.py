import os
import requests
import zipfile
import json
import sys
import xml.etree.ElementTree as ET

########################################## To fetch the config.json and config.zip ##########################################
# Get URL from command-line argument
param = sys.argv[1]

# Define the URL based on the parameter
if param == "NY":
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/nammayatriconsumer/android/cug/config.json"
    appName = "in.yatri.consumer"
    print(f"URL NY :::::: " + url)
elif param == "OY":
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/nammayatriconsumer/android/cug/config.json"
    appName = "in.yatri.consumer"
    print(f"URL NY :::::: " + url)
elif param == "MY":
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/nammayatriconsumer/android/cug/config.json"
    appName = "in.yatri.consumer"
    print(f"URL MY :::::: " + url)
elif param == "YS":
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/yatrisathiconsumer/android/cug/config.json"
    appName = "in.yatri.consumer"
    print(f"URL YS :::::: " + url)
elif param == "Y":
    # Default URL if no match is found
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/yatriconsumer/android/cug/config.json"
    appName = "in.yatri.consumer"
    print(f"URL Y :::::: " + url)
elif param == "BT":
    url = "https://assets.juspay.in/hyper/bundles/in.juspay.merchants/nammayatriconsumer/android/cug/config.json"
    appName = "in.mobility.bharatTaxi"
    print(f"URL BT :::::: " + url)


# Define the directory to save the config files
directory = 'configs'
os.makedirs(directory, exist_ok=True)

# Fetch the JSON data from the URL
response = requests.get(url)
if response.status_code == 200:
    data = response.json()

    # Save the JSON data as config.json
    config_json_path = os.path.join(directory, "config.json")
    with open(config_json_path, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Exported config.json")

# Fetch the JSON data from the URL
response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    # Check if the specified app exists in the JSON data
    if appName in data['new']['assets']:
        # Get the URL for the configuration file
        config_url = data['new']['assets'][appName].get('configuration')

        # If the URL exists, download the configuration file
        if config_url:
            response = requests.get(config_url)
            if response.status_code == 200:
                # Save the downloaded ZIP file
                config_zip_path = os.path.join(directory, "config.zip")
                with open(config_zip_path, 'wb') as f:
                    f.write(response.content)
                    print(f"Downloaded config.zip")

                # Unzip the downloaded file and extract .jsa file
                with zipfile.ZipFile(config_zip_path, 'r') as zip_ref:
                    extracted_files = zip_ref.namelist()
                    for file in extracted_files:
                        if file.endswith('.jsa'):
                            zip_ref.extract(file, directory)
                            print(f"Extracted {file}")

                # Remove the downloaded ZIP file
                os.remove(config_zip_path)

            else:
                print("Failed to download configuration file")
                sys.exit(1)
        else:
            print("Configuration URL not found for appName")
            sys.exit(1)

    # Check if the specified package exists in the JSON data
    if appName in data['new']['package']:
        # Get the URL for the package file
        package_url = data['new']['package'].get(appName)

        # If the URL exists, download the package file
        if package_url:
            response = requests.get(package_url)
            if response.status_code == 200:
                # Save the downloaded ZIP file
                package_zip_path = os.path.join(directory, "index_bundle.zip")
                with open(package_zip_path, 'wb') as f:
                    f.write(response.content)
                    print(f"Downloaded index_bundle.zip")

                # Unzip the downloaded file and extract .jsa file
                with zipfile.ZipFile(package_zip_path, 'r') as zip_ref:
                    extracted_files = zip_ref.namelist()
                    for file in extracted_files:
                        if file.endswith('.jsa'):
                            zip_ref.extract(file, directory)
                            print(f"Extracted {file}")

                # Remove the downloaded ZIP file
                os.remove(package_zip_path)

            else:
                print("Failed to download package file")
                sys.exit(1)
        else:
            print("Package URL not found for appName ")
            sys.exit(1)
    else:
        print("appName not found in JSON data")
        sys.exit(1)
else:
    print("Failed to fetch JSON data from the URL Error: {response.text}")
    sys.exit(1)
