import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { MetadataPreview } from '../components/MetadataPreview';
import { PhotoPanel } from '../components/PhotoPanel';
import { cloneTagGroups, riskyByDefaultTags } from '../metadata/exifTags';
import type { CloneResult, PickedPhoto } from '../metadata/types';
import { styles } from '../styles/appStyles';
import { tagLabel } from '../utils/metadata';

export function MetadataEditScreen({
  busy,
  draftMetadata,
  editMessage,
  editPhoto,
  editResult,
  onBack,
  onChangeValue,
  onPickPhoto,
  onSave,
}: {
  busy: boolean;
  draftMetadata: Record<string, string>;
  editMessage: string | null;
  editPhoto: PickedPhoto | null;
  editResult: CloneResult | null;
  onBack: () => void;
  onChangeValue: (tag: string, value: string) => void;
  onPickPhoto: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>元数据编辑</Text>
          <Text style={styles.pageSubtitle}>选择单张照片并保存编辑副本</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PhotoPanel
          title="要编辑的照片"
          actionLabel={editPhoto ? '重新选择' : '选择照片'}
          photo={editPhoto}
          message={editMessage}
          onPress={onPickPhoto}
        />

        {editPhoto ? (
          <View style={styles.metadataPreview}>
            <MetadataPreview label="拍摄时间" value={draftMetadata.DateTimeOriginal || draftMetadata.DateTime} />
            <MetadataPreview label="时区" value={draftMetadata.OffsetTimeOriginal || draftMetadata.OffsetTime} />
            <MetadataPreview
              label="位置"
              value={
                draftMetadata.GPSLatitude && draftMetadata.GPSLongitude
                  ? `${draftMetadata.GPSLatitudeRef || ''} ${draftMetadata.GPSLatitude}, ${
                      draftMetadata.GPSLongitudeRef || ''
                    } ${draftMetadata.GPSLongitude}`
                  : ''
              }
            />
            <MetadataPreview
              label="设备"
              value={[draftMetadata.Make, draftMetadata.Model].filter(Boolean).join(' ')}
            />
          </View>
        ) : null}

        {editPhoto ? (
          <>
            {cloneTagGroups.map((group) => (
              <View key={group.id} style={styles.group}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.tags.map((option) => {
                  const risky = riskyByDefaultTags.has(option.tag);
                  return (
                    <View key={option.tag} style={styles.editRow}>
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        {risky ? <Text style={styles.riskBadge}>谨慎</Text> : null}
                      </View>
                      <Text style={styles.optionTag}>{option.tag}</Text>
                      <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!busy}
                        multiline
                        placeholder="留空表示不写入；清空已有值会删除该项"
                        placeholderTextColor="#8a93a3"
                        style={[styles.editInput, busy ? styles.editInputDisabled : null]}
                        value={draftMetadata[option.tag] || ''}
                        onChangeText={(value) => onChangeValue(option.tag, value)}
                      />
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>保存方式</Text>
              <Text style={styles.noticeText}>应用会把修改后的照片保存为新副本，原照片不会被覆盖。只会写入发生变化的元数据项。</Text>
            </View>
          </>
        ) : null}

        {editResult ? (
          <View style={styles.resultRow}>
            <Text style={editResult.success ? (editResult.failedTags?.length ? styles.partialBadge : styles.successBadge) : styles.failBadge}>
              {editResult.success ? (editResult.failedTags?.length ? '部分' : '成功') : '失败'}
            </Text>
            <View style={styles.resultTextBlock}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {editResult.fileName || editPhoto?.fileName || '编辑照片'}
              </Text>
              <Text style={styles.resultDetail}>
                {editResult.success ? editResult.warning || editResult.outputUri || '已保存编辑副本' : editResult.error || '未知错误'}
              </Text>
              {editResult.success && editResult.failedTags?.length ? (
                <Text style={styles.resultWarning} numberOfLines={3}>
                  未通过校验：{editResult.failedTags.map(tagLabel).join('、')}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        {busy ? <ActivityIndicator color="#155eef" /> : null}
        <Pressable
          disabled={busy || !editPhoto}
          style={({ pressed }) => [
            styles.primaryButton,
            busy || !editPhoto ? styles.disabledButton : null,
            pressed ? styles.pressed : null,
          ]}
          onPress={onSave}
        >
          <Text style={styles.primaryButtonText}>保存编辑副本</Text>
        </Pressable>
      </View>
    </View>
  );
}
