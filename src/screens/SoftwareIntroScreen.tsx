import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function SoftwareIntroScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>软件介绍</Text>
          <Text style={styles.pageSubtitle}>应用定位和主要功能</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.docIntro}>
          EXIF助手 是一款 Android 本地照片元数据克隆工具。你可以从一张源照片读取拍摄时间、位置、相机、镜头和曝光等信息，并把勾选的元数据写入一张或多张目标照片副本，用于修复修图、导出或转发后丢失的照片信息。
        </Text>

        <DocSection title="核心功能模块">
          <Bullet text="源照片读取：选择一张包含元数据的原图，应用会读取当前版本支持克隆的 EXIF 信息。" />
          <Bullet text="目标照片选择：选择一张或多张需要修复元数据的照片，应用不会覆盖原图。" />
          <Bullet text="克隆内容设置：在克隆内容页面按分组勾选要写入的时间、位置、相机、镜头和曝光项目。" />
          <Bullet text="结果查看：克隆完成后查看每张目标照片的成功、失败或部分保留情况。" />
          <Bullet text="更多与更新：查看软件介绍、使用帮助、隐私政策、版本记录，并主动检查新版本。" />
        </DocSection>

        <DocSection title="主要功能">
          <Bullet text="元数据读取：用户选择源照片后，应用会显示已读取到的可克隆项目，帮助确认源照片是否适合作为模板。" />
          <Bullet text="批量克隆：用户可以一次选择多张目标照片，应用会逐张生成带元数据的新副本。" />
          <Bullet text="按项勾选：用户只写入自己勾选的元数据项，未勾选内容不会被克隆。" />
          <Bullet text="PNG 输出选择：目标照片包含 PNG 时，用户可以继续保存 PNG，也可以另存为 JPEG 以提升元数据可见性。" />
          <Bullet text="本地结果保存：输出图片保存在系统图片库的 EXIF助手 目录中，文件名保留目标原名并追加导出时间。" />
        </DocSection>

        <DocSection title="使用特点">
          <Bullet text="应用围绕“源照片、目标照片、克隆内容、结果”四步组织流程。" />
          <Bullet text="基础克隆流程在设备本地完成，不需要账号、云同步、广告或统计。" />
          <Bullet text="源照片 GPS 读取可能需要照片位置信息权限，未授权时系统可能隐藏照片内的位置元数据。" />
          <Bullet text="目标照片格式、编码和查看器兼容性会影响最终可见效果；结果页会尽量展示失败原因或部分保留情况。" />
          <Bullet text="检查更新只有在用户主动点击时才联网。" />
        </DocSection>
      </ScrollView>
    </View>
  );
}

function DocSection({ children, title }: { children: React.ReactNode; title: string }) {
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
