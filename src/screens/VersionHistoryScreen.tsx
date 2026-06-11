import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function VersionHistoryScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>版本记录</Text>
          <Text style={styles.pageSubtitle}>按版本倒序排列</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <VersionNode number="v1.2.0" title="元数据编辑入口" date="2026-06-11">
          <VersionGroup title="新增">
            <Bullet text="首页新增“元数据编辑”入口，并作为独立页面进入。" />
            <Bullet text="支持选择单张照片，手动编辑当前克隆流程支持的时间、位置、相机、镜头和曝光元数据。" />
            <Bullet text="编辑保存会生成新副本，不覆盖原照片；PNG 照片写入前可选择继续保存 PNG 或另存为 JPEG。" />
          </VersionGroup>
        </VersionNode>

        <VersionNode number="v1.1.0" title="更多页与更新入口" date="2026-05-23">
          <VersionGroup title="新增">
            <Bullet text="新增更多页体系，集中查看软件介绍、使用帮助、隐私政策、版本记录和检查更新。" />
            <Bullet text="新增检查更新流程，可主动检查 GitHub 发布版本，并在有安装包时下载、安装或删除。" />
            <Bullet text="新增项目主页入口，可从应用内打开 GitHub 项目页。" />
          </VersionGroup>
        </VersionNode>

        <VersionNode number="v1.0.1" title="体验与克隆流程更新" date="2026-05-23">
          <VersionGroup title="新增">
            <Bullet text="新增 PNG 目标处理提示，克隆前可选择继续保存 PNG 或另存为 JPEG。" />
          </VersionGroup>
          <VersionGroup title="优化">
            <Bullet text="优化导出副本命名，保留目标原名并追加 _exifhelper_yyyyMMdd_HHmmss 后缀。" />
            <Bullet text="优化目标照片格式识别，未知格式会明确提示不支持。" />
          </VersionGroup>
          <VersionGroup title="修复">
            <Bullet text="修复顶部安全边距偶发失效，页面标题不再贴近系统状态栏。" />
            <Bullet text="移除当前功能不需要的相机权限。" />
          </VersionGroup>
        </VersionNode>

        <VersionNode number="v1.0.0" title="初始版本" date="2026-05-11">
          <Bullet text="支持选择一张源照片和一张或多张目标照片。" />
          <Bullet text="支持克隆拍摄时间、时区、地理位置、相机信息、镜头信息和曝光参数。" />
          <Bullet text="支持 JPG、JPEG 和 PNG 目标图片写入，并把输出副本保存到 Pictures/EXIF助手。" />
          <Bullet text="提供克隆内容页面，用户可以按项勾选要写入的元数据。" />
          <Bullet text="提供结果页，展示每张目标照片的成功、失败和部分保留情况。" />
          <Bullet text="基础处理在设备本地完成，不提供账号、云同步、广告或统计功能。" />
        </VersionNode>
      </ScrollView>
    </View>
  );
}

function VersionNode({
  children,
  date,
  number,
  title,
}: {
  children: React.ReactNode;
  date: string;
  number: string;
  title: string;
}) {
  return (
    <View style={styles.versionNode}>
      <Text style={styles.versionNumber}>{number}</Text>
      <Text style={styles.versionTitle}>{title}</Text>
      <Text style={styles.versionDate}>{date}</Text>
      {children}
    </View>
  );
}

function VersionGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View>
      <Text style={styles.versionGroupTitle}>{title}：</Text>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return <Text style={styles.docBullet}>- {text}</Text>;
}
