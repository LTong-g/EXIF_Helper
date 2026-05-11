import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { MetadataPreview } from '../components/MetadataPreview';
import { PhotoPanel } from '../components/PhotoPanel';
import { TargetPanel } from '../components/TargetPanel';
import type { PickedPhoto } from '../metadata/types';
import { styles } from '../styles/appStyles';

export function HomeScreen({
  busy,
  sourceMetadata,
  sourceMessage,
  sourcePhoto,
  targetMessage,
  targetPhotos,
  onPickSource,
  onPickTargets,
  onOpenCloneOptions,
  onBack,
}: {
  busy: boolean;
  sourceMetadata: Record<string, string>;
  sourceMessage: string | null;
  sourcePhoto: PickedPhoto | null;
  targetMessage: string | null;
  targetPhotos: PickedPhoto[];
  onPickSource: () => void;
  onPickTargets: () => void;
  onOpenCloneOptions: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>元数据克隆</Text>
          <Text style={styles.pageSubtitle}>选择源照片和目标照片</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PhotoPanel
          title="源照片"
          actionLabel={sourcePhoto ? '重新选择' : '选择源照片'}
          photo={sourcePhoto}
          message={sourceMessage}
          onPress={onPickSource}
        />

        {sourcePhoto ? (
          <View style={styles.metadataPreview}>
            <MetadataPreview label="拍摄时间" value={sourceMetadata.DateTimeOriginal || sourceMetadata.DateTime} />
            <MetadataPreview label="时区" value={sourceMetadata.OffsetTimeOriginal || sourceMetadata.OffsetTime} />
            <MetadataPreview
              label="位置"
              value={
                sourceMetadata.GPSLatitude && sourceMetadata.GPSLongitude
                  ? `${sourceMetadata.GPSLatitudeRef || ''} ${sourceMetadata.GPSLatitude}, ${
                      sourceMetadata.GPSLongitudeRef || ''
                    } ${sourceMetadata.GPSLongitude}`
                  : ''
              }
            />
            <MetadataPreview
              label="设备"
              value={[sourceMetadata.Make, sourceMetadata.Model].filter(Boolean).join(' ')}
            />
          </View>
        ) : null}

        <TargetPanel message={targetMessage} targetPhotos={targetPhotos} onPress={onPickTargets} />
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
          onPress={onOpenCloneOptions}
        >
          <Text style={styles.primaryButtonText}>设置克隆</Text>
        </Pressable>
      </View>
    </View>
  );
}
