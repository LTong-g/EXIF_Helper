import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';

export type DialogTone = 'info' | 'warning' | 'error';
export type AppDialogState = {
  title: string;
  message: string;
  tone: DialogTone;
} | null;

export function AppDialog({ dialog, onClose }: { dialog: AppDialogState; onClose: () => void }) {
  const toneStyle =
    dialog?.tone === 'error' ? styles.dialogIconError : dialog?.tone === 'warning' ? styles.dialogIconWarning : styles.dialogIconInfo;
  const toneText = dialog?.tone === 'error' ? '!' : dialog?.tone === 'warning' ? '!' : 'i';

  return (
    <Modal transparent animationType="fade" visible={dialog != null} onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <View style={[styles.dialogIcon, toneStyle]}>
            <Text style={styles.dialogIconText}>{toneText}</Text>
          </View>
          <Text style={styles.dialogTitle}>{dialog?.title}</Text>
          <Text style={styles.dialogMessage}>{dialog?.message}</Text>
          <Pressable style={({ pressed }) => [styles.dialogButton, pressed ? styles.pressed : null]} onPress={onClose}>
            <Text style={styles.dialogButtonText}>知道了</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
