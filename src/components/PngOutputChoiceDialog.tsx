import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export function PngOutputChoiceDialog({
  visible,
  onChooseJpeg,
  onChoosePng,
  onClose,
}: {
  visible: boolean;
  onChooseJpeg: () => void;
  onChoosePng: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <View style={[styles.dialogIcon, styles.dialogIconWarning]}>
            <Text style={styles.dialogIconText}>!</Text>
          </View>
          <Text style={styles.dialogTitle}>PNG 元数据可见性有限</Text>
          <Text style={styles.dialogMessage}>
            PNG 文件可以写入元数据，但很多 Android 相册只显示拍摄时间，可能不显示相机、镜头、GPS 和曝光信息。另存为 JPEG
            通常能让这些信息更容易被相册和 EXIF 工具识别。
          </Text>
          <View style={styles.dialogActionRow}>
            <Pressable style={({ pressed }) => [styles.dialogSecondaryButton, pressed ? styles.pressed : null]} onPress={onChoosePng}>
              <Text style={styles.dialogSecondaryButtonText}>继续保存 PNG</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.dialogPrimaryActionButton, pressed ? styles.pressed : null]} onPress={onChooseJpeg}>
              <Text style={styles.dialogButtonText}>另存为 JPEG</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
