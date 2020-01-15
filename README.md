# react-native-test-ocr
## Example of using react-native-text-detector in both iOS and Android

LeonSanta has created a very fantastic example of using react-native-text-detector here https://github.com/LeonSanta/React-Native-PictureOCR
Unfortunately, it doesn't work in iOS due to the sandbox policy of Apple https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html

In iOS, your app cannot read the photo in gallery directly, it will encounter the error: NSURLConnection finished with error - code -1002. I have posted a question at https://stackoverflow.com/questions/59726747/react-native-text-detector-worked-fine-in-android-but-why-it-always-returned-fal

Here is my approach:
1. Use RNFS.copyAssetsFileIOS copy photo to temp file at your app documents
2. Use react-native-text-detector to analyze that temp file
  
