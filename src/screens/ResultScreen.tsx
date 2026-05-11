import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { CloneResult } from '../metadata/types';
import { styles } from '../styles/appStyles';
import { tagLabel } from '../utils/metadata';

export function ResultScreen({
  results,
  onBack,
  onHome,
}: {
  results: CloneResult[];
  onBack: () => void;
  onHome: () => void;
}) {
  const successCount = results.filter((result) => result.success).length;
  const failedCount = results.length - successCount;
  const partialCount = results.filter((result) => result.success && result.failedTags && result.failedTags.length > 0).length;

  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>克隆结果</Text>
          <Text style={styles.pageSubtitle}>
            成功 {successCount} 张，部分 {partialCount} 张，失败 {failedCount} 张
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {results.map((result, index) => (
          <View key={`${result.targetUri}-${index}`} style={styles.resultRow}>
            <Text style={result.success ? (result.failedTags?.length ? styles.partialBadge : styles.successBadge) : styles.failBadge}>
              {result.success ? (result.failedTags?.length ? '部分' : '成功') : '失败'}
            </Text>
            <View style={styles.resultTextBlock}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {result.fileName || `目标照片 ${index + 1}`}
              </Text>
              <Text style={styles.resultDetail}>
                {result.success ? result.warning || result.outputUri || '已保存副本' : result.error || '未知错误'}
              </Text>
              {result.success && result.failedTags?.length ? (
                <Text style={styles.resultWarning} numberOfLines={3}>
                  未通过校验：{result.failedTags.map(tagLabel).join('、')}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomBar}>
        <Pressable style={styles.primaryButton} onPress={onHome}>
          <Text style={styles.primaryButtonText}>回到首页</Text>
        </Pressable>
      </View>
    </View>
  );
}
