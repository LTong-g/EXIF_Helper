import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function MainHomeScreen({
  onOpenClone,
  onOpenEdit,
  onOpenMore,
}: {
  onOpenClone: () => void;
  onOpenEdit: () => void;
  onOpenMore: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.appName}>EXIF助手</Text>
        <Text style={styles.subtitle}>本地修复照片拍摄时间、位置、相机和曝光元数据</Text>
      </View>

      <ScrollView contentContainerStyle={styles.homeContent}>
        <Pressable style={({ pressed }) => [styles.featureCard, pressed ? styles.pressed : null]} onPress={onOpenEdit}>
          <View style={styles.featureIconEdit}>
            <View style={styles.editIconPencil}>
              <View style={styles.editIconPencilEnd} />
              <View style={styles.editIconPencilBody} />
              <View style={styles.editIconPencilTip} />
            </View>
          </View>
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>元数据编辑</Text>
            <Text style={styles.featureSubtitle}>选择单张照片，手动修改支持的元数据并保存为新副本。</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.featureCard, pressed ? styles.pressed : null]} onPress={onOpenClone}>
          <View style={styles.featureIcon}>
            <View style={styles.copyIconBack} />
            <View style={styles.copyIconFront} />
          </View>
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>元数据克隆</Text>
            <Text style={styles.featureSubtitle}>从源照片读取勾选的元数据，写入一张或多张目标照片副本。</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.featureCard, pressed ? styles.pressed : null]} onPress={onOpenMore}>
          <View style={styles.featureIconMuted}>
            <View style={styles.moreIconDot} />
            <View style={styles.moreIconDot} />
            <View style={styles.moreIconDot} />
          </View>
          <View style={styles.featureTextBlock}>
            <Text style={styles.featureTitle}>更多</Text>
            <Text style={styles.featureSubtitle}>查看版本信息、隐私说明和权限相关入口。</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
