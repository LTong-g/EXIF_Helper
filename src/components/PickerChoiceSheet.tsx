import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import type { ImagePickMode } from '../native/ExifCloneModule';
import { styles } from '../styles/appStyles';

export type PickRole = 'source' | 'target' | 'edit';

export function PickerChoiceSheet({
  visible,
  role,
  onClose,
  onPickMode,
}: {
  visible: boolean;
  role: PickRole | null;
  onClose: () => void;
  onPickMode: (mode: ImagePickMode) => void;
}) {
  const title = role === 'target' ? '选择目标照片' : role === 'edit' ? '选择要编辑的照片' : '选择源照片';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.pickerCard}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Pressable style={({ pressed }) => [styles.pickModeButton, pressed ? styles.pressed : null]} onPress={() => onPickMode('gallery')}>
            <View style={styles.pickModeIcon}>
              <Text style={styles.pickModeIconText}>图</Text>
            </View>
            <View style={styles.pickModeTextBlock}>
              <Text style={styles.pickModeTitle}>相册/图库</Text>
              <Text style={styles.pickModeSubtitle}>系统照片界面</Text>
            </View>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.pickModeButton, pressed ? styles.pressed : null]} onPress={() => onPickMode('files')}>
            <View style={styles.pickModeIcon}>
              <Text style={styles.pickModeIconText}>文</Text>
            </View>
            <View style={styles.pickModeTextBlock}>
              <Text style={styles.pickModeTitle}>文件选择</Text>
              <Text style={styles.pickModeSubtitle}>文件、云盘或其他位置</Text>
            </View>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.cancelButton, pressed ? styles.pressed : null]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
