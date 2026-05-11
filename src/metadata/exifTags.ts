import type { CloneTagGroup } from './types';

export const cloneTagGroups: CloneTagGroup[] = [
  {
    id: 'time',
    title: '时间与时区',
    tags: [
      { tag: 'DateTimeOriginal', label: '原始拍摄时间', defaultSelected: true },
      { tag: 'DateTimeDigitized', label: '数字化时间', defaultSelected: true },
      { tag: 'DateTime', label: '文件时间', defaultSelected: true },
      { tag: 'SubSecTimeOriginal', label: '原始拍摄亚秒', defaultSelected: true },
      { tag: 'SubSecTimeDigitized', label: '数字化亚秒', defaultSelected: true },
      { tag: 'SubSecTime', label: '文件亚秒', defaultSelected: true },
      { tag: 'OffsetTimeOriginal', label: '原始拍摄时区', defaultSelected: true },
      { tag: 'OffsetTimeDigitized', label: '数字化时区', defaultSelected: true },
      { tag: 'OffsetTime', label: '文件时区', defaultSelected: true },
    ],
  },
  {
    id: 'gps',
    title: '地理位置',
    tags: [
      { tag: 'GPSLatitude', label: '纬度', defaultSelected: true },
      { tag: 'GPSLatitudeRef', label: '纬度方向', defaultSelected: true },
      { tag: 'GPSLongitude', label: '经度', defaultSelected: true },
      { tag: 'GPSLongitudeRef', label: '经度方向', defaultSelected: true },
      { tag: 'GPSAltitude', label: '海拔', defaultSelected: true },
      { tag: 'GPSAltitudeRef', label: '海拔参考', defaultSelected: true },
      { tag: 'GPSDateStamp', label: 'GPS 日期', defaultSelected: true },
      { tag: 'GPSTimeStamp', label: 'GPS 时间', defaultSelected: true },
      { tag: 'GPSProcessingMethod', label: 'GPS 处理方式', defaultSelected: true },
      { tag: 'GPSMapDatum', label: 'GPS 坐标基准', defaultSelected: true },
    ],
  },
  {
    id: 'camera',
    title: '相机信息',
    tags: [
      { tag: 'Make', label: '厂商', defaultSelected: true },
      { tag: 'Model', label: '型号', defaultSelected: true },
      { tag: 'Software', label: '软件', defaultSelected: true },
      { tag: 'ImageWidth', label: '图像宽度', riskyByDefault: true },
      { tag: 'ImageLength', label: '图像高度', riskyByDefault: true },
      { tag: 'Orientation', label: '方向', riskyByDefault: true },
    ],
  },
  {
    id: 'lens',
    title: '镜头信息',
    tags: [
      { tag: 'LensMake', label: '镜头厂商', defaultSelected: true },
      { tag: 'LensModel', label: '镜头型号', defaultSelected: true },
      { tag: 'LensSpecification', label: '镜头规格', defaultSelected: true },
      { tag: 'FocalLength', label: '焦距', defaultSelected: true },
      { tag: 'FocalLengthIn35mmFilm', label: '35mm 等效焦距', defaultSelected: true },
    ],
  },
  {
    id: 'exposure',
    title: '曝光参数',
    tags: [
      { tag: 'ExposureTime', label: '快门时间', defaultSelected: true },
      { tag: 'FNumber', label: '光圈值', defaultSelected: true },
      { tag: 'ISOSpeedRatings', label: 'ISO', defaultSelected: true },
      { tag: 'PhotographicSensitivity', label: '感光度', defaultSelected: true },
      { tag: 'ExposureBiasValue', label: '曝光补偿', defaultSelected: true },
      { tag: 'ExposureProgram', label: '曝光程序', defaultSelected: true },
      { tag: 'MeteringMode', label: '测光模式', defaultSelected: true },
      { tag: 'Flash', label: '闪光灯', defaultSelected: true },
      { tag: 'WhiteBalance', label: '白平衡', defaultSelected: true },
      { tag: 'ApertureValue', label: 'APEX 光圈', defaultSelected: true },
      { tag: 'ShutterSpeedValue', label: 'APEX 快门', defaultSelected: true },
      { tag: 'BrightnessValue', label: '亮度值', defaultSelected: true },
    ],
  },
];

export const allCloneTags = cloneTagGroups.flatMap((group) => group.tags.map((tag) => tag.tag));

export const defaultSelectedTags = cloneTagGroups.flatMap((group) =>
  group.tags.filter((tag) => tag.defaultSelected).map((tag) => tag.tag)
);

export const riskyByDefaultTags = new Set(
  cloneTagGroups.flatMap((group) =>
    group.tags.filter((tag) => tag.riskyByDefault).map((tag) => tag.tag)
  )
);
