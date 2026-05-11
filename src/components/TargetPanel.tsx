import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import type { PickedPhoto } from '../metadata/types';
import { styles } from '../styles/appStyles';

export function TargetPanel({
  message,
  targetPhotos,
  onPress,
}: {
  message: string | null;
  targetPhotos: PickedPhoto[];
  onPress: () => void;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>目标照片</Text>
        <Pressable style={styles.secondaryButton} onPress={onPress}>
          <Text style={styles.secondaryButtonText}>{targetPhotos.length > 0 ? '重新选择' : '选择目标照片'}</Text>
        </Pressable>
      </View>
      <Text style={styles.targetCount}>已选择 {targetPhotos.length} 张</Text>
      {targetPhotos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbStrip}>
          {targetPhotos.slice(0, 30).map((photo, index) => (
            <Image key={`${photo.uri}-${index}`} source={{ uri: photo.uri }} style={styles.targetThumb} />
          ))}
          {targetPhotos.length > 30 ? (
            <View style={styles.moreThumb}>
              <Text style={styles.moreThumbText}>+{targetPhotos.length - 30}</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>未选择</Text>
      )}
      {message ? <Text style={styles.panelMessage}>{message}</Text> : null}
    </View>
  );
}
