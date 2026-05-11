import { NativeModules } from 'react-native';

import type { ApplyCloneRequest, CloneResult, PickedPhoto } from '../metadata/types';

type ExifCloneNativeModule = {
  pickImages(allowMultiple: boolean, mode: ImagePickMode): Promise<PickedPhoto[]>;
  readMetadata(uri: string): Promise<Record<string, string>>;
  applyClone(request: ApplyCloneRequest): Promise<CloneResult[]>;
};

export type ImagePickMode = 'gallery' | 'files';

const nativeModule = NativeModules.ExifCloneModule as ExifCloneNativeModule | undefined;

export function readMetadata(uri: string): Promise<Record<string, string>> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.readMetadata(uri);
}

export function pickImages(allowMultiple: boolean, mode: ImagePickMode): Promise<PickedPhoto[]> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.pickImages(allowMultiple, mode);
}

export function applyClone(request: ApplyCloneRequest): Promise<CloneResult[]> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.applyClone(request);
}
