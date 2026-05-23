import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>隐私政策</Text>
          <Text style={styles.pageSubtitle}>数据、权限和本地处理边界</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PolicySection title="数据记录范围">
          <Bullet text="基础功能会读取用户主动选择的源照片和目标照片，用于读取或写入用户勾选的照片元数据。" />
          <Bullet text="应用会保存用户主动生成的输出图片副本，副本包含用户勾选写入的元数据。" />
          <Bullet text="应用会保存少量运行设置或临时状态，例如本地已下载更新包状态。" />
          <Bullet text="开启照片位置信息权限后，应用可能读取源照片文件中已有的 GPS 元数据；应用不会读取实时定位。" />
          <Bullet text="正常使用不要求注册账号，不收集姓名、手机号、邮箱、通讯录、麦克风或摄像头信息。" />
          <Bullet text="应用不提供直接拍照入口，不主动读取未被用户选择的相册内容。" />
        </PolicySection>

        <PolicySection title="本地存储">
          <Bullet text="照片元数据处理在当前设备本地完成，输出副本保存到系统图片库的 EXIF助手 目录。" />
          <Bullet text="设置数据和已下载更新包保存在当前设备的应用专属目录或系统图片库中。" />
          <Bullet text="正常运行时不会持续记录日志；开发调试日志只用于定位异常，不作为用户数据上传。" />
          <Bullet text="卸载应用、清除应用数据或手动删除系统图片库文件，可能导致设置、缓存、更新包或输出副本被删除。" />
          <Bullet text="本应用不提供云同步服务，也不会主动把照片或记录上传到服务器。" />
        </PolicySection>

        <PolicySection title="导入、导出与分享">
          <Bullet text="应用不提供账号导入导出功能；照片输入来自用户主动选择的源照片和目标照片。" />
          <Bullet text="克隆结果会生成新的 JPG、JPEG 或 PNG 图片副本，文件内容由用户自行保存、转移或分享。" />
          <Bullet text="输出副本可能包含拍摄时间、位置、相机、镜头和曝光等用户勾选写入的敏感元数据。" />
          <Bullet text="如果用户通过系统相册、文件管理器或分享面板把输出副本发送给其他应用，对方应用的隐私规则由对应应用负责。" />
          <Bullet text="应用只读取用户通过系统选择器选择的文件，不会扫描或批量读取其他照片。" />
        </PolicySection>

        <PolicySection title="权限与联网">
          <Bullet text="应用基础克隆功能不需要账号登录或联网同步。" />
          <Bullet text="用户点击检查更新时，应用会访问 GitHub 发布接口，用于判断是否存在新版。" />
          <Bullet text="用户确认下载后，安装包会保存到应用专属目录；应用启动或进入更多页时会检查本地安装包是否仍然有效。" />
          <Bullet text="安装更新时系统可能要求允许本应用安装未知应用；用户可以在系统设置中开启或关闭该权限。" />
          <Bullet text="文件选择通过系统相册/图库或 SAF 文件选择器完成，应用无法在系统选择器内部加入自定义按钮。" />
          <Bullet text="读取源照片 GPS 可能需要 Android 照片位置信息权限；应用不需要相机权限。" />
        </PolicySection>

        <PolicySection title="用户控制">
          <Bullet text="用户可以自行选择源照片、目标照片和要克隆的元数据项。" />
          <Bullet text="用户可以在系统相册或文件管理器中删除输出副本。" />
          <Bullet text="用户可以通过更多页删除已下载的新版本安装包。" />
          <Bullet text="用户可以通过系统设置清除应用数据或管理照片位置信息、安装未知应用等权限。" />
          <Bullet text="用户应自行保管、删除或分享输出图片和下载的安装包；本隐私政策不代表第三方应用的隐私承诺。" />
        </PolicySection>
      </ScrollView>
    </View>
  );
}

function PolicySection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.docSection}>
      <Text style={styles.docSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return <Text style={styles.docBullet}>- {text}</Text>;
}
