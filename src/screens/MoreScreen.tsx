import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function MoreScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>更多</Text>
          <Text style={styles.pageSubtitle}>版本、隐私和权限入口</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.moreSection}>
          <Text style={styles.moreSectionTitle}>版本信息</Text>
          <Text style={styles.moreSectionText}>EXIF助手 1.0.0</Text>
        </View>

        <View style={styles.moreSection}>
          <Text style={styles.moreSectionTitle}>隐私政策</Text>
          <Text style={styles.moreSectionText}>当前版本只在设备本地处理照片元数据，不提供账号、云同步、广告或统计功能。</Text>
        </View>

        <View style={styles.moreSection}>
          <Text style={styles.moreSectionTitle}>权限设置</Text>
          <Text style={styles.moreSectionText}>读取源照片 GPS 时可能需要照片位置信息权限。后续会在这里补充系统设置入口。</Text>
        </View>
      </ScrollView>
    </View>
  );
}
