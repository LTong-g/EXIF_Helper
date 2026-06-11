import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function UsageHelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>使用帮助</Text>
          <Text style={styles.pageSubtitle}>主要页面和常用操作</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.docIntro}>本页整理软件内主要页面和常用操作方式，方便用户快速上手。</Text>

        <HelpSection title="首页 / 主页面">
          <Bullet text="首页展示“元数据编辑”、“元数据克隆”和“更多”三个入口。" />
          <Bullet text="点击“元数据编辑”进入单张照片元数据编辑页面。" />
          <Bullet text="点击“元数据克隆”进入照片选择流程。" />
          <Bullet text="点击“更多”进入应用信息、说明文档、隐私说明、版本记录和检查更新入口。" />
          <Bullet text="首页本身不展示克隆内容勾选项，克隆内容需要在后续页面设置。" />
        </HelpSection>

        <HelpSection title="元数据编辑页面">
          <Bullet text="进入元数据编辑后，选择一张需要修改元数据的照片。" />
          <Bullet text="应用会读取当前支持的元数据字段，并按时间、位置、相机、镜头和曝光分组显示输入框。" />
          <Bullet text="修改字段后点击“保存编辑副本”，应用只写入发生变化的元数据项并生成新副本。" />
          <Bullet text="清空已有字段会在保存副本时删除该项；没有修改内容时不会保存。" />
          <Bullet text="元数据编辑不覆盖原照片，输出副本同样保存到 Pictures/EXIF助手。" />
        </HelpSection>

        <HelpSection title="选择源照片和目标照片">
          <Bullet text="进入元数据克隆后，先选择一张源照片，再选择一张或多张目标照片。" />
          <Bullet text="选择照片时会先出现应用内入口，可以使用系统相册/图库，也可以使用 SAF 文件选择器。" />
          <Bullet text="源照片选择后，应用会读取可克隆元数据，并在页面中显示读取状态。" />
          <Bullet text="目标照片选择不设置应用内数量上限，实际数量受系统选择器、内存、处理性能和权限返回结果限制。" />
          <Bullet text="如果没有源照片、没有可克隆元数据或没有目标照片，“设置克隆”会提示需要补齐条件。" />
        </HelpSection>

        <HelpSection title="克隆内容页面">
          <Bullet text="点击底部“设置克隆”进入克隆内容页面。" />
          <Bullet text="页面按时间与时区、地理位置、相机信息、镜头信息和曝光参数分组展示可克隆项。" />
          <Bullet text="每个元数据项以复选框形式展示，用户只会克隆已勾选的项目。" />
          <Bullet text="源照片中没有值的项目会显示为不可用或无法勾选。" />
          <Bullet text="点击“开始克隆”后，应用会逐张处理目标照片并生成新副本。" />
        </HelpSection>

        <HelpSection title="PNG 目标照片">
          <Bullet text="如果克隆目标或编辑照片是 PNG，点击写入按钮时会先出现提示。" />
          <Bullet text="选择“继续保存 PNG”会保持 PNG 输出，但部分相册或工具可能不显示 PNG 内部元数据。" />
          <Bullet text="选择“另存为 JPEG”会把 PNG 目标另存为 JPEG 副本，再写入 EXIF；透明区域会以白底合成。" />
          <Bullet text="JPG 和 JPEG 目标不会触发 PNG 输出选择。" />
        </HelpSection>

        <HelpSection title="结果页">
          <Bullet text="结果页按目标照片展示处理结果。" />
          <Bullet text="成功表示目标副本已保存且勾选元数据通过应用读回校验。" />
          <Bullet text="部分表示副本已保存，但目标格式或查看器可能没有保留全部元数据。" />
          <Bullet text="失败会展示对应目标照片无法处理的原因，例如格式不支持或文件无法打开。" />
          <Bullet text="点击返回可回到上一页，点击回首页可结束本次流程。" />
        </HelpSection>

        <HelpSection title="权限或高级功能">
          <Bullet text="读取源照片 GPS 时，Android 10 及以上可能要求照片位置信息权限。" />
          <Bullet text="未授予照片位置信息权限时，系统可能隐藏源照片中的 GPS 元数据；授予后需要重新选择源照片。" />
          <Bullet text="应用不提供直接拍照入口，因此不需要相机权限。" />
          <Bullet text="检查更新需要用户主动点击，发现新版本后可下载 APK，安装时系统可能要求允许本应用安装未知应用。" />
          <Bullet text="关闭权限不会删除已有输出副本；删除照片需要在系统相册或文件管理器中操作。" />
        </HelpSection>

        <HelpSection title="更多页">
          <Bullet text="软件介绍：查看应用定位、核心功能和使用特点。" />
          <Bullet text="使用帮助：查看主要页面和常用操作说明。" />
          <Bullet text="隐私政策：查看数据、权限、本地存储、导入导出和联网说明。" />
          <Bullet text="版本记录：查看更新历史。" />
          <Bullet text="检查更新：检查、下载、安装或删除新版本安装包。" />
          <Bullet text="项目主页：调用系统浏览器打开 GitHub 项目页。" />
        </HelpSection>
      </ScrollView>
    </View>
  );
}

function HelpSection({ children, title }: { children: React.ReactNode; title: string }) {
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
