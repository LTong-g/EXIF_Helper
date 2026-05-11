import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import type { PickedPhoto } from '../metadata/types';
import { styles } from '../styles/appStyles';

export function PhotoPanel({
  title,
  actionLabel,
  photo,
  message,
  onPress,
}: {
  title: string;
  actionLabel: string;
  photo: PickedPhoto | null;
  message?: string | null;
  onPress: () => void;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Pressable style={styles.secondaryButton} onPress={onPress}>
          <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
        </Pressable>
      </View>
      {photo ? (
        <View style={styles.photoSummary}>
          <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
          <View style={styles.photoInfo}>
            <Text style={styles.photoName} numberOfLines={1}>
              {photo.fileName || '已选择照片'}
            </Text>
            <Text style={styles.photoDetail}>
              {photo.width} x {photo.height}
            </Text>
            <Text style={styles.photoDetail}>{photo.mimeType || 'image/*'}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>未选择</Text>
      )}
      {message ? <Text style={styles.panelMessage}>{message}</Text> : null}
    </View>
  );
}
