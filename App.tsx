import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppDialog, type AppDialogState, type DialogTone } from './src/components/AppDialog';
import { PickerChoiceSheet, type PickRole } from './src/components/PickerChoiceSheet';
import { PngOutputChoiceDialog } from './src/components/PngOutputChoiceDialog';
import { allCloneTags, defaultSelectedTags } from './src/metadata/exifTags';
import type { CloneResult, PickedPhoto } from './src/metadata/types';
import type { RootStackParamList } from './src/navigation/types';
import { applyClone, applyEdit, pickImages, readMetadata, type ImagePickMode } from './src/native/ExifCloneModule';
import { CloneOptionsScreen } from './src/screens/CloneOptionsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MainHomeScreen } from './src/screens/MainHomeScreen';
import { MetadataEditScreen } from './src/screens/MetadataEditScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SoftwareIntroScreen } from './src/screens/SoftwareIntroScreen';
import { UsageHelpScreen } from './src/screens/UsageHelpScreen';
import { VersionHistoryScreen } from './src/screens/VersionHistoryScreen';
import { styles } from './src/styles/appStyles';
import { toUserFacingMessage } from './src/utils/errors';
import { hasMetadataValue } from './src/utils/metadata';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [sourcePhoto, setSourcePhoto] = useState<PickedPhoto | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<PickedPhoto[]>([]);
  const [sourceMetadata, setSourceMetadata] = useState<Record<string, string>>({});
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [targetMessage, setTargetMessage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set(defaultSelectedTags));
  const [results, setResults] = useState<CloneResult[]>([]);
  const [editPhoto, setEditPhoto] = useState<PickedPhoto | null>(null);
  const [editOriginalMetadata, setEditOriginalMetadata] = useState<Record<string, string>>({});
  const [editDraftMetadata, setEditDraftMetadata] = useState<Record<string, string>>({});
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editResult, setEditResult] = useState<CloneResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<AppDialogState>(null);
  const [pickerRole, setPickerRole] = useState<PickRole | null>(null);
  const [showPngOutputChoice, setShowPngOutputChoice] = useState(false);
  const [showEditPngOutputChoice, setShowEditPngOutputChoice] = useState(false);

  const selectedTagCount = selectedTags.size;

  function showDialog(title: string, message: string, tone: DialogTone = 'info') {
    setDialog({ title, message, tone });
  }

  async function pickSource(mode: ImagePickMode) {
    try {
      const canReadMediaLocation = await requestMediaLocationPermission();
      const photos = await pickImages(false, mode);
      if (photos.length === 0) {
        return;
      }

      if (!photos[0]) {
        const message = '系统选择器没有返回照片，请重新选择。';
        setSourceMessage(message);
        showDialog('选择失败', message, 'warning');
        return;
      }

      const photo = photos[0];
      setSourcePhoto(photo);
      setSourceMetadata({});
      setSourceMessage('已选择源照片，正在读取可克隆元数据。');
      setBusy(true);
      const metadata = await readMetadata(photo.uri);
      const metadataTags = Object.keys(metadata);
      setSourceMetadata(metadata);
      setSelectedTags(new Set(defaultSelectedTags.filter((tag) => hasMetadataValue(metadata, tag))));
      const gpsMissing = !metadata.GPSLatitude || !metadata.GPSLongitude;
      if (metadataTags.length === 0) {
        const message = '已选择照片，但没有读取到当前版本支持克隆的元数据。可以换一张原图，或继续选择目标照片后查看克隆内容页面。';
        setSourceMessage(message);
        showDialog('未读取到可克隆元数据', message, 'warning');
      } else if (!canReadMediaLocation && gpsMissing) {
        const message = `已读取 ${metadataTags.length} 个可克隆元数据项。未获得照片位置信息权限，GPS 元数据可能被系统隐藏。`;
        setSourceMessage(message);
        showDialog('GPS 可能被隐藏', '如果源照片应包含 GPS，请允许照片位置信息权限后重新选择源照片。', 'warning');
      } else {
        setSourceMessage(`已读取 ${metadataTags.length} 个可克隆元数据项。`);
      }
    } catch (error) {
      const message = `已选择照片，但${toUserFacingMessage(error, 'read')}`;
      console.warn('读取源照片元数据失败', error);
      setSourceMessage(message);
      showDialog('读取失败', message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function pickTargets(mode: ImagePickMode) {
    try {
      const photos = await pickImages(true, mode);
      if (photos.length === 0) {
        return;
      }

      setTargetPhotos(photos);
      setTargetMessage(null);
    } catch (error) {
      const message = toUserFacingMessage(error, 'pickTarget');
      console.warn('选择目标照片失败', error);
      setTargetMessage(message);
      showDialog('选择失败', message, 'error');
    }
  }

  async function pickEditPhoto(mode: ImagePickMode) {
    try {
      const canReadMediaLocation = await requestMediaLocationPermission();
      const photos = await pickImages(false, mode);
      if (photos.length === 0) {
        return;
      }

      if (!photos[0]) {
        const message = '系统选择器没有返回照片，请重新选择。';
        setEditMessage(message);
        showDialog('选择失败', message, 'warning');
        return;
      }

      const photo = photos[0];
      setEditPhoto(photo);
      setEditOriginalMetadata({});
      setEditDraftMetadata({});
      setEditResult(null);
      setEditMessage('已选择照片，正在读取可编辑元数据。');
      setBusy(true);
      const metadata = await readMetadata(photo.uri);
      const metadataTags = Object.keys(metadata);
      setEditOriginalMetadata(metadata);
      setEditDraftMetadata(metadata);
      const gpsMissing = !metadata.GPSLatitude || !metadata.GPSLongitude;
      if (metadataTags.length === 0) {
        setEditMessage('已选择照片，未读取到当前版本支持的元数据。仍可手动填写字段后保存副本。');
      } else if (!canReadMediaLocation && gpsMissing) {
        const message = `已读取 ${metadataTags.length} 个可编辑元数据项。未获得照片位置信息权限，GPS 元数据可能被系统隐藏。`;
        setEditMessage(message);
        showDialog('GPS 可能被隐藏', '如果照片应包含 GPS，请允许照片位置信息权限后重新选择照片。', 'warning');
      } else {
        setEditMessage(`已读取 ${metadataTags.length} 个可编辑元数据项。`);
      }
    } catch (error) {
      const message = `已选择照片，但${toUserFacingMessage(error, 'read')}`;
      console.warn('读取编辑照片元数据失败', error);
      setEditMessage(message);
      showDialog('读取失败', message, 'error');
    } finally {
      setBusy(false);
    }
  }

  function openPicker(role: PickRole) {
    if (!busy) {
      setPickerRole(role);
    }
  }

  function closePicker() {
    setPickerRole(null);
  }

  function choosePickerMode(mode: ImagePickMode) {
    const role = pickerRole;
    setPickerRole(null);
    if (role === 'source') {
      void pickSource(mode);
    }
    if (role === 'target') {
      void pickTargets(mode);
    }
    if (role === 'edit') {
      void pickEditPhoto(mode);
    }
  }

  function openCloneOptions(navigation: RootNavigation) {
    if (!sourcePhoto) {
      showDialog('还没有源照片', '请先选择一张包含元数据的源照片。', 'warning');
      return;
    }
    if (Object.keys(sourceMetadata).length === 0) {
      showDialog('源照片没有可克隆元数据', sourceMessage || '当前源照片没有读取到可克隆元数据，请换一张原图。', 'warning');
      return;
    }
    if (targetPhotos.length === 0) {
      showDialog('还没有目标照片', '请至少选择一张需要写入元数据的目标照片。', 'warning');
      return;
    }
    navigation.navigate('CloneOptions');
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function targetHasPng() {
    return targetPhotos.some((photo) => {
      const fileName = photo.fileName?.toLowerCase() || '';
      const uri = photo.uri.toLowerCase();
      return photo.mimeType === 'image/png' || fileName.endsWith('.png') || uri.includes('.png');
    });
  }

  function editTargetHasPng() {
    if (!editPhoto) {
      return false;
    }
    const fileName = editPhoto.fileName?.toLowerCase() || '';
    const uri = editPhoto.uri.toLowerCase();
    return editPhoto.mimeType === 'image/png' || fileName.endsWith('.png') || uri.includes('.png');
  }

  function startCloneWithPngChoice(navigation: RootNavigation) {
    if (!sourcePhoto || targetPhotos.length === 0 || selectedTags.size === 0) {
      showDialog('无法克隆', '请确认已选择源照片、目标照片和至少一个元数据项。', 'warning');
      return;
    }
    if (targetHasPng()) {
      setShowPngOutputChoice(true);
      return;
    }
    void startClone(navigation, 'png');
  }

  async function startClone(navigation: RootNavigation, pngOutputMode: 'png' | 'jpeg') {
    if (!sourcePhoto || targetPhotos.length === 0 || selectedTags.size === 0) {
      showDialog('无法克隆', '请确认已选择源照片、目标照片和至少一个元数据项。', 'warning');
      return;
    }

    try {
      setShowPngOutputChoice(false);
      setBusy(true);
      const cloneResults = await applyClone({
        sourceUri: sourcePhoto.uri,
        targetUris: targetPhotos.map((photo) => photo.uri),
        tags: Array.from(selectedTags),
        pngOutputMode,
      });
      setResults(cloneResults);
      navigation.navigate('Result');
    } catch (error) {
      console.warn('克隆失败', error);
      showDialog('克隆失败', toUserFacingMessage(error, 'clone'), 'error');
    } finally {
      setBusy(false);
    }
  }

  function changeEditValue(tag: string, value: string) {
    setEditDraftMetadata((current) => ({ ...current, [tag]: value }));
  }

  function changedEditAttributes() {
    return allCloneTags.reduce<Record<string, string>>((attributes, tag) => {
      const originalValue = editOriginalMetadata[tag] || '';
      const nextValue = editDraftMetadata[tag] || '';
      if (nextValue !== originalValue) {
        attributes[tag] = nextValue;
      }
      return attributes;
    }, {});
  }

  function startEditWithPngChoice() {
    if (!editPhoto) {
      showDialog('还没有照片', '请先选择一张需要编辑元数据的照片。', 'warning');
      return;
    }
    const attributes = changedEditAttributes();
    if (Object.keys(attributes).length === 0) {
      showDialog('没有修改内容', '请先修改至少一个元数据项，再保存编辑副本。', 'warning');
      return;
    }
    if (editTargetHasPng()) {
      setShowEditPngOutputChoice(true);
      return;
    }
    void startEdit('png');
  }

  async function startEdit(pngOutputMode: 'png' | 'jpeg') {
    if (!editPhoto) {
      showDialog('还没有照片', '请先选择一张需要编辑元数据的照片。', 'warning');
      return;
    }
    const attributes = changedEditAttributes();
    if (Object.keys(attributes).length === 0) {
      showDialog('没有修改内容', '请先修改至少一个元数据项，再保存编辑副本。', 'warning');
      return;
    }

    try {
      setShowEditPngOutputChoice(false);
      setBusy(true);
      const result = await applyEdit({
        targetUri: editPhoto.uri,
        attributes,
        pngOutputMode,
      });
      setEditResult(result);
      if (result.success) {
        setEditOriginalMetadata(editDraftMetadata);
      }
      setEditMessage(result.success ? '已保存编辑副本。' : result.error || '保存失败。');
    } catch (error) {
      console.warn('编辑保存失败', error);
      showDialog('保存失败', toUserFacingMessage(error, 'edit'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ExpoStatusBar style="dark" backgroundColor="#f6f7f9" translucent />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f6f7f9' } }}>
            <Stack.Screen name="Home">
              {({ navigation }) => (
                <MainHomeScreen
                  onOpenClone={() => navigation.navigate('CloneHome')}
                  onOpenEdit={() => navigation.navigate('MetadataEdit')}
                  onOpenMore={() => navigation.navigate('More')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="MetadataEdit">
              {({ navigation }) => (
                <>
                  <MetadataEditScreen
                    busy={busy}
                    draftMetadata={editDraftMetadata}
                    editMessage={editMessage}
                    editPhoto={editPhoto}
                    editResult={editResult}
                    onBack={navigation.goBack}
                    onChangeValue={changeEditValue}
                    onPickPhoto={() => openPicker('edit')}
                    onSave={startEditWithPngChoice}
                  />
                  <PngOutputChoiceDialog
                    visible={showEditPngOutputChoice}
                    onClose={() => setShowEditPngOutputChoice(false)}
                    onChoosePng={() => startEdit('png')}
                    onChooseJpeg={() => startEdit('jpeg')}
                  />
                </>
              )}
            </Stack.Screen>
            <Stack.Screen name="CloneHome">
              {({ navigation }) => (
                <HomeScreen
                  busy={busy}
                  sourceMetadata={sourceMetadata}
                  sourceMessage={sourceMessage}
                  sourcePhoto={sourcePhoto}
                  targetMessage={targetMessage}
                  targetPhotos={targetPhotos}
                  onBack={navigation.goBack}
                  onPickSource={() => openPicker('source')}
                  onPickTargets={() => openPicker('target')}
                  onOpenCloneOptions={() => openCloneOptions(navigation)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CloneOptions">
              {({ navigation }) => (
                <>
                  <CloneOptionsScreen
                    busy={busy}
                    selectedTagCount={selectedTagCount}
                    selectedTags={selectedTags}
                    sourceMetadata={sourceMetadata}
                    targetCount={targetPhotos.length}
                    onBack={navigation.goBack}
                    onStartClone={() => startCloneWithPngChoice(navigation)}
                    onToggleTag={toggleTag}
                  />
                  <PngOutputChoiceDialog
                    visible={showPngOutputChoice}
                    onClose={() => setShowPngOutputChoice(false)}
                    onChoosePng={() => startClone(navigation, 'png')}
                    onChooseJpeg={() => startClone(navigation, 'jpeg')}
                  />
                </>
              )}
            </Stack.Screen>
            <Stack.Screen name="Result">
              {({ navigation }) => (
                <ResultScreen
                  results={results}
                  onBack={navigation.goBack}
                  onHome={() => navigation.popToTop()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="More">
              {({ navigation }) => (
                <MoreScreen
                  onBack={navigation.goBack}
                  onOpenPrivacyPolicy={() => navigation.navigate('PrivacyPolicy')}
                  onOpenSoftwareIntro={() => navigation.navigate('SoftwareIntro')}
                  onOpenUsageHelp={() => navigation.navigate('UsageHelp')}
                  onOpenVersionHistory={() => navigation.navigate('VersionHistory')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SoftwareIntro">
              {({ navigation }) => <SoftwareIntroScreen onBack={navigation.goBack} />}
            </Stack.Screen>
            <Stack.Screen name="UsageHelp">
              {({ navigation }) => <UsageHelpScreen onBack={navigation.goBack} />}
            </Stack.Screen>
            <Stack.Screen name="PrivacyPolicy">
              {({ navigation }) => <PrivacyPolicyScreen onBack={navigation.goBack} />}
            </Stack.Screen>
            <Stack.Screen name="VersionHistory">
              {({ navigation }) => <VersionHistoryScreen onBack={navigation.goBack} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <AppDialog dialog={dialog} onClose={() => setDialog(null)} />
        <PickerChoiceSheet
          visible={pickerRole != null}
          role={pickerRole}
          onClose={closePicker}
          onPickMode={choosePickerMode}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

async function requestMediaLocationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 29) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION;
  const granted = await PermissionsAndroid.check(permission);
  if (granted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: '允许读取照片位置信息',
    message: '用于从源照片 EXIF 中读取 GPS 元数据，不会读取实时定位。',
    buttonPositive: '允许',
    buttonNegative: '拒绝',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
