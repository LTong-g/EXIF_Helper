import { NativeModules } from 'react-native';

import type { ApplyCloneRequest, ApplyEditRequest, CloneResult, PickedPhoto } from '../metadata/types';

type ExifCloneNativeModule = {
  pickImages(allowMultiple: boolean, mode: ImagePickMode): Promise<PickedPhoto[]>;
  readMetadata(uri: string): Promise<Record<string, string>>;
  applyClone(request: ApplyCloneRequest): Promise<CloneResult[]>;
  applyEdit(request: ApplyEditRequest): Promise<CloneResult>;
  getAppInfo(): Promise<AppInfo>;
  getDownloadedUpdate(): Promise<DownloadedUpdate | null>;
  downloadUpdate(request: DownloadUpdateRequest): Promise<DownloadedUpdate>;
  deleteDownloadedUpdate(): Promise<boolean>;
  installDownloadedUpdate(): Promise<InstallUpdateResult>;
};

export type ImagePickMode = 'gallery' | 'files';

export type AppInfo = {
  packageName: string;
  versionName: string;
  versionCode: number;
};

export type DownloadUpdateRequest = {
  url: string;
  version: string;
  fileName: string;
};

export type DownloadedUpdate = {
  fileName: string;
  filePath: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  size: number;
};

export type InstallUpdateResult = {
  status: 'opened' | 'needsPermission';
};

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

export function applyEdit(request: ApplyEditRequest): Promise<CloneResult> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.applyEdit(request);
}

export function getAppInfo(): Promise<AppInfo> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.getAppInfo();
}

export function getDownloadedUpdate(): Promise<DownloadedUpdate | null> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.getDownloadedUpdate();
}

export function downloadUpdate(request: DownloadUpdateRequest): Promise<DownloadedUpdate> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.downloadUpdate(request);
}

export function deleteDownloadedUpdate(): Promise<boolean> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.deleteDownloadedUpdate();
}

export function installDownloadedUpdate(): Promise<InstallUpdateResult> {
  if (!nativeModule) {
    return Promise.reject(new Error('EXIF 原生模块未加载，请使用 Android 开发构建运行。'));
  }
  return nativeModule.installDownloadedUpdate();
}
