import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { riskyByDefaultTags } from '../metadata/exifTags';
import type { CloneTagDefinition } from '../metadata/types';
import { styles } from '../styles/appStyles';

export function MetadataOption({
  disabled,
  option,
  selected,
  value,
  onToggle,
}: {
  disabled: boolean;
  option: CloneTagDefinition;
  selected: boolean;
  value?: string;
  onToggle: () => void;
}) {
  const risky = riskyByDefaultTags.has(option.tag);

  return (
    <Pressable
      disabled={disabled}
      style={[styles.optionRow, disabled ? styles.optionDisabled : null]}
      onPress={onToggle}
    >
      <View style={styles.optionTextBlock}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionLabel}>{option.label}</Text>
          {risky ? <Text style={styles.riskBadge}>谨慎</Text> : null}
        </View>
        <Text style={styles.optionTag}>{option.tag}</Text>
        <Text style={styles.optionValue} numberOfLines={2}>
          {disabled ? '源照片没有该项' : value}
        </Text>
      </View>
      <Switch disabled={disabled} value={selected && !disabled} onValueChange={onToggle} />
    </Pressable>
  );
}
