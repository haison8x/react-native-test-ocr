/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Button,
  Image,
  Text,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import RNTextDetector from 'react-native-text-detector';
import RNFS from 'react-native-fs';
import CameraRollPicker from 'react-native-camera-roll-picker';
import {RNCamera as Camera} from 'react-native-camera';

import {Dimensions, Platform} from 'react-native';
const {height, width} = Dimensions.get('window');

const PICTURE_OPTIONS = {
  quality: 1,
  fixOrientation: true,
  forceUpOrientation: true,
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: 'https://facebook.github.io/react-native/img/tiny_logo.png',
      showCameraRollPicker: false,
      showCamera: false,
      selectedImages: [],
    };
  }

  showCameraRollPicker = async () => {
    const os = Platform.OS; // android or ios
    if (os === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({showCameraRollPicker: true});
      } else {
        Alert.alert(
          'Bạn phải cấp quyền truy cập kho hình ảnh mới có thể sử dụng chức năng này',
        );
      }
    } else {
      this.setState({showCameraRollPicker: true});
    }
  };

  getSelectedImages = async images => {
    images = images || [];
    if (images.length === 0 || images[0] === null) {
      return;
    }

    this.setState({
      selectedImages: images,
    });
    try {
      this.setState(
        {
          showCameraRollPicker: false,
        },
        () => {
          this.processImage(this.state.selectedImages[0].uri);
        },
      );
    } catch (e) {
      console.warn(e);
      this.reset(e);
    }
  };

  processImage = async uri => {
    const visionResp = (await RNTextDetector.detectFromUri(uri)) || [];
    const visionText = visionResp.map(v => v.text).join();

    let binaryLength = 0;
    try {
      const base64 = (await RNFS.readFile(uri, 'base64')) || '';
      binaryLength = base64.length;
    } catch (e) {
      console.log('error in readFile', e);
    }
    this.setState({
      selectedImages: [],
      imageUrl: uri,
      visionText: visionText,
      binaryLength: binaryLength,
      showCamera: false,
      showCameraRollPicker: false,
    });
  };

  takePicture = async camera => {
    try {
      const data = await camera.takePictureAsync(PICTURE_OPTIONS);
      this.setState({
        showCamera: false,
      });
      if (!data.uri) {
        throw 'OTHER';
      }
      this.setState(
        {
          imageUrl: data.uri,
        },
        () => {
          this.processImage(data.uri);
        },
      );
    } catch (e) {
      console.warn(e);
      this.reset(e);
    }
  };

  getCameraView = () => {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.screen}>
          <Camera
            ref={cam => {
              this.camera = cam;
            }}
            key="camera"
            style={styles.camera}
            notAuthorizedView={null}
            flashMode={Camera.Constants.FlashMode.off}>
            {({camera, status}) => {
              if (status !== 'READY') {
                return null;
              }
              return (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => this.takePicture(camera)}
                    style={styles.circle}
                  />
                </View>
              );
            }}
          </Camera>
        </View>
      </SafeAreaView>
    );
  };
  getRollPickerView = () => {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <Button
          title="Cancel"
          onPress={() => this.setState({showCameraRollPicker: false})}></Button>
        <CameraRollPicker
          groupTypes="All"
          assetType="Photos"
          maximum={1}
          selected={this.state.selectedImages}
          imagesPerRow={2}
          imageMargin={5}
          emptyText="Không tìm thấy hình ảnh nào."
          callback={this.getSelectedImages}
        />
      </SafeAreaView>
    );
  };

  render() {
    if (this.state.showCameraRollPicker) {
      return this.getRollPickerView();
    }

    if (this.state.showCamera) {
      return this.getCameraView();
    }

    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.sectionContainer}>
              <Button
                title="Do OCR From Library Image"
                onPress={() => this.showCameraRollPicker()}
              />
              <Button
                title="Do OCR From Camera"
                onPress={() => this.setState({showCamera: true})}
              />
              <Image
                style={{width: 50, height: 50}}
                source={{
                  uri: this.state.imageUrl,
                }}
              />
              <Text>Uri: {this.state.imageUrl}</Text>
              <Text>OCR Text: {this.state.visionText}</Text>
              <Text>File length by RNFS:{this.state.binaryLength}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  cameraContainer: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  buttonContainer: {
    width: 70,
    height: 70,
    backgroundColor: Colors.white,
    borderRadius: 35,
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    flex: 1,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
  },
  circle: {
    width: 64,
    height: 64,
    backgroundColor: '#000',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#000',
  },
});

export default App;
