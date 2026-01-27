# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: install yarn

```bash
brew install yarn
```

## Step 2: install dependency

```bash
yarn install
```

## Step 3: run rescript

```bash
yarn run re:start
```

## Step 4: Start the Metro Server

```bash
yarn start
```

## Step 4: Start your Application

### 4.1 For Android Setup

#### 4.1.1. if you don't have any emulator running

    ```bash
    - First list down the installed emulators
    command : ~/Library/Android/sdk/tools/emulator -list-avds
    - then run an emulator from the list
    command ~/Library/Android/sdk/emulator/emulator -avd <Emulator_Name>
    ```

#### 4.1.2. create/update local.properties in consumer/android/local.properties

    ```bash
        google.maps.api.key={API_KEY}
        MERCHANT_ID = {MERCHANT_ID}
        CONFIG_URL = {MERCHANT_ID}
    ```

#### 4.1.3. add GoogleService file
add `google-services.json` file inside consumer/android/app

#### 4.1.4. build using `Android Studio` or start menu

### 4.2 For iOS Setup

#### 4.2.1. install node(v20) and ruby(v3.2)

```bash
brew install node@20
brew install ruby@3.2
```
add path to your terminal(if you are using zsh, installer itself will provide the command to do that)  
re-run the terminal and check using `--version` (or `-v` ) if they are installed correctly

#### 4.2.2. Fetch nammayatri-ios repository

```bash
git submodule update --init --recursive
git submodule update --remote
```
Note: you need to have the access to the nammayatri-ios repository and set up your SSH key 

#### 4.2.3. install ruby dependecies
run this command inside consumer/ios folder
```bash
bundle install
```

#### 4.2.4. install ruby dependencies
run this command inside consumer folder
```bash
yarn pod-install
```
if it fails for some dependencies try 
```bash
yarn pod-install --repo-update
```

if iOS setup issues	
Error:
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
Fix:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### 4.2.5. add GoogleService file
add  `GoogleService-Info.plist`  in  

-   `consumer/ios`
-   `consumer/ios/[variant_name]/Plist`

#### 4.2.6. Build using `Xcode` or start menu

### 4.3 Run the required app from menu

```bash
Multi-Platform App Launcher - Debug Menu

B - Android Bridge
N - Android Nammayatri
S - Android Yatrisathi
Y - Android Yatri
M - Android Manayatri
b - IOS Bridge
n - IOS Nammayatri
s - IOS Yatrisathi
y - IOS Yatri
m - IOS Manayatri
r - Reload app
d - Open Dev Menu


Note: if you face any errors in IOS then clean the project and try reinstalling cocoapods again
cd ios
rm -rf build
rm -rf Pods
pod install
```

## Step 5 (Optional): Run Android/IOS manually by custom commands

#### For Android BuildVariants

```bash
comamnd: yarn run android:variant <BuildVariantName>
eg:      yarn run android:variant BridgeDevDebug

comamnd: yarn run android:variant <BuildVariantName> --appId {appId} (specify appId to launch the app)
eg1:     yarn run android:variant BridgeDevDebug --appId com.mobility.movingtech.debug
```

#### Run app updating mobility_assets

```bash
comamnd: yarn run-android <BuildVarientName> {appId} (specify appId to launch the app)
eg:      yarn run-android BridgeDevDebug com.mobility.movingtech.debug
```

#### Android BuildVariants

BridgeDevDebug --appId com.mobility.movingtech.debug
BridgeDevRelease --appId com.mobility.movingtech
BridgeProdDebug --appId com.mobility.movingtech.debug
BridgeProdRelease --appId com.mobility.movingtech
NammaYatriDevDebug --appId in.juspay.nammayatri.debug
NammaYatriDevRelease --appId in.juspay.nammayatri
NammaYatriProdDebug --appId in.juspay.nammayatri.debug
NammaYatriProdRelease --appId in.juspay.nammayatri
YatriDevDebug --appId net.openkochi.yatri.debug
YatriDevRelease --appId net.openkochi.yatri
YatriProdDebug --appId net.openkochi.yatri.debug
YatriProdRelease --appId net.openkochi.yatri
ManaYatriDevDebug --appId in.mobility.manayatri.debug
ManaYatriDevRelease --appId in.mobility.manayatri
ManaYatriProdDebug --appId in.mobility.manayatri.debug
ManaYatriProdRelease --appId in.mobility.manayatri
YatriSathiDevDebug --appId in.juspay.jatrisaathi.debug
YatriSathiDevRelease --appId in.juspay.jatrisaathi
YatriSathiProdDebug --appId in.juspay.jatrisaathi.debug
YatriSathiProdRelease --appId in.juspay.jatrisaathi

### For iOS BuildVariants/Targets

```bash
command: yarn run ios:variant <BuildVariantName>
eg:      yarn run ios:variant Bridge-Debug
```

#### Run app updating mobility_assets

```bash
comamnd: yarn run-ios <BuildVarientName>
eg:      yarn run-ios Bridge-Debug
```

#### iOS BuildVariants/Targets

Bridge-Debug
Bridge-Release
NammaYatri-Debug
NammaYatri-Release
Yatri-Debug
Yatri-Release
ManaYatri-Debug
Manayatri-Release
YatriSathi-Debug
YatriSathi-Release

# React Native Debugger Setup

1. In `consumer/src/typescript/navigation/RootNavigation.tsx` Update the following piece of code section as below:
    ```
    // const accessToken = useAppSelector(selectToken);
    // const isRetrying = false;

    // [React Native Debugger] Comment above 2 lines `isRetrying` and `accessToken` and Uncomment this for __DEV__, required for React Native Debugger to Run.
    const { accessToken, isRetrying } = useRetryAccessToken();     
    ```
2. In `consumer/src/typescript/state/store.ts` Enable the devTools.
    ```
    devTools: true, // [React Native Debugger] Set this to `true` for React Native Debugger to Run.
    ```
3. In `consumer/src-v2/screens/Search/components/FloatingMapButton.tsx` Update the following piece of code section as below:
    ```
    // const { height, progress } = useAppKeyboardAnimation();

    // [React Native Debugger] Comment above animation hook and Uncomment this for __DEV__, required for React Native Debugger to Run.
    const { height, progress } = { height: { value: 0 }, progress: { value: 0 } };
    ```
4. Open React Native Debugger, `brew install --cask react-native-debugger`.
5. Run the App, in Android press `CMD + M` and click on Start Debugging.
