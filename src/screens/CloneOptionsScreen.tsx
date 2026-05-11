import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { MetadataOption } from '../components/MetadataOption';
import { cloneTagGroups } from '../metadata/exifTags';
import { styles } from '../styles/appStyles';

export function CloneOptionsScreen({
  busy,
  selectedTagCount,
  selectedTags,
  sourceMetadata,
  targetCount,
  onBack,
  onStartClone,
  onToggleTag,
}: {
  busy: boolean;
  selectedTagCount: number;
  selectedTags: Set<string>;
  sourceMetadata: Record<string, string>;
  targetCount: number;
  onBack: () => void;
  onStartClone: () => void;
  onToggleTag: (tag: string) => void;
}) {
  const sourceHasValue = (tag: string) => sourceMetadata[tag] != null && sourceMetadata[tag] !== '';

  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>克隆内容</Text>
          <Text style={styles.pageSubtitle}>已勾选 {selectedTagCount} 项，目标 {targetCount} 张</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {cloneTagGroups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.tags.map((tag) => (
              <MetadataOption
                key={tag.tag}
                disabled={!sourceHasValue(tag.tag)}
                option={tag}
                selected={selectedTags.has(tag.tag)}
                value={sourceMetadata[tag.tag]}
                onToggle={() => onToggleTag(tag.tag)}
              />
            ))}
          </View>
        ))}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>写入方式</Text>
          <Text style={styles.noticeText}>应用会为目标照片生成带新元数据的副本，原照片不会被覆盖。</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {busy ? <ActivityIndicator color="#155eef" /> : null}
        <Pressable
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryButton,
            busy ? styles.disabledButton : null,
            pressed ? styles.pressed : null,
          ]}
          onPress={onStartClone}
        >
          <Text style={styles.primaryButtonText}>开始克隆</Text>
        </Pressable>
      </View>
    </View>
  );
}
