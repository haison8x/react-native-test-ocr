import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

export default class RNFSHelper {
  async mkdir(filepath, options) {
    var existed = await RNFS.exists(filepath);
    if (existed) {
      return;
    }

    options = options || {
      NSURLIsExcludedFromBackupKey: true,
    };

    await RNFS.mkdir(filepath, options);
  }

  async cleandir(dirpath) {
    const readDirItems = await RNFS.readDir(dirpath);
    const count = readDirItems.length;
    for (let i = 0; i < count; i++) {
      if (readDirItems[i].isFile()) {
        await RNFS.unlink(readDirItems[i].path);
      }
    }
  }

  async unlink(filepath) {
    await RNFS.unlink(filepath);
  }

  async createTempFileIfIOS(imageUri, width, height) {
    if (Platform.OS === 'android') {
      return imageUri;
    }

    return await this.copyAssetsFileIOSToTempFile(imageUri, width, height);
  }

  async copyAssetsFileIOSToTempFile(imageUri, width, height) {
    width = width || 0;
    height = height || 0;
    const tempDir = `${RNFS.DocumentDirectoryPath}/tempdir`;
    await this.mkdir(tempDir);
    await this.cleandir(tempDir);

    const destPath = `${tempDir}/temp`;
    const actualFilePath = await RNFS.copyAssetsFileIOS(
      imageUri,
      destPath,
      width,
      height,
    );

    return `file://${actualFilePath}`;
  }
}
