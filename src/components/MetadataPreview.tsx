import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function MetadataPreview({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue} numberOfLines={1}>
        {value || '无'}
      </Text>
    </View>
  );
}
