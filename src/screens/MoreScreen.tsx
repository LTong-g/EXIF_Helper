import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Pressable, Text, View } from 'react-native';

import {
  deleteDownloadedUpdate,
  downloadUpdate,
  getAppInfo,
  getDownloadedUpdate,
  installDownloadedUpdate,
  type AppInfo,
  type DownloadedUpdate,
} from '../native/ExifCloneModule';
import { styles } from '../styles/appStyles';

type MoreScreenProps = {
  onBack: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenSoftwareIntro: () => void;
  onOpenUsageHelp: () => void;
  onOpenVersionHistory: () => void;
};

type UpdateState = 'idle' | 'checking' | 'downloading';
type ActionStyle = 'primary' | 'secondary' | 'muted';
type ActionDialogState = {
  title: string;
  message: string;
  actions: Array<{
    label: string;
    style?: ActionStyle;
    onPress: () => void;
  }>;
} | null;

type GitHubRelease = {
  tag_name?: string;
  name?: string;
  body?: string;
  html_url?: string;
  assets?: Array<{
    name?: string;
    browser_download_url?: string;
  }>;
};

const PROJECT_HOME_URL = 'https://github.com/LTong-g/EXIF_Helper';
const LATEST_RELEASE_URL = 'https://api.github.com/repos/LTong-g/EXIF_Helper/releases/latest';
const FALLBACK_VERSION = '1.2.0';

export function MoreScreen({
  onBack,
  onOpenPrivacyPolicy,
  onOpenSoftwareIntro,
  onOpenUsageHelp,
  onOpenVersionHistory,
}: MoreScreenProps) {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    packageName: '',
    versionName: FALLBACK_VERSION,
    versionCode: 0,
  });
  const [downloadedUpdate, setDownloadedUpdate] = useState<DownloadedUpdate | null>(null);
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [dialog, setDialog] = useState<ActionDialogState>(null);

  useEffect(() => {
    void refreshLocalUpdateState();
  }, []);

  const updateLabel = useMemo(() => {
    if (updateState === 'checking') {
      return '正在检查';
    }
    if (updateState === 'downloading') {
      return '正在下载';
    }
    if (downloadedUpdate) {
      return '已下载新版本';
    }
    return '检查更新';
  }, [downloadedUpdate, updateState]);

  async function refreshLocalUpdateState() {
    try {
      const [info, localUpdate] = await Promise.all([getAppInfo(), getDownloadedUpdate()]);
      setAppInfo(info);
      setDownloadedUpdate(localUpdate);
    } catch (error) {
      console.warn('读取应用版本或本地更新包失败', error);
    }
  }

  async function openProjectHome() {
    try {
      await Linking.openURL(PROJECT_HOME_URL);
    } catch (error) {
      console.warn('打开项目主页失败', error);
      showInfoDialog('打开失败', '打开失败，无法打开项目主页。');
    }
  }

  async function openExternalUrl(url: string, failureMessage: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('打开外部链接失败', error);
      showInfoDialog('打开失败', failureMessage);
    }
  }

  async function handleUpdatePress() {
    if (updateState !== 'idle') {
      return;
    }
    if (downloadedUpdate) {
      showDownloadedUpdateDialog(downloadedUpdate);
      return;
    }
    await checkForUpdate();
  }

  async function checkForUpdate() {
    setUpdateState('checking');
    try {
      const response = await fetch(LATEST_RELEASE_URL, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const release = (await response.json()) as GitHubRelease;
      const latestVersion = normalizeVersion(release.tag_name || release.name || '');
      if (!latestVersion) {
        throw new Error('最新版本信息缺少版本号');
      }

      if (compareSemanticVersions(latestVersion, appInfo.versionName) <= 0) {
        showInfoDialog('已是最新版本', `当前版本：v${appInfo.versionName}\n最新版本：v${latestVersion}`);
        return;
      }

      const apkAsset = release.assets?.find((asset) => {
        const name = asset.name?.toLowerCase() || '';
        return name.endsWith('.apk') && asset.browser_download_url;
      });

      if (!apkAsset?.browser_download_url || !apkAsset.name) {
        setDialog({
          title: '该版本未提供安装包附件',
          message: `当前版本：v${appInfo.versionName}\n最新版本：v${latestVersion}`,
          actions: [
            { label: '稍后', style: 'muted', onPress: () => setDialog(null) },
            {
              label: '打开发布页',
              style: 'primary',
              onPress: () => {
                setDialog(null);
                void openExternalUrl(release.html_url || PROJECT_HOME_URL, '打开失败，无法打开项目主页。');
              },
            },
          ],
        });
        return;
      }

      setDialog({
        title: '发现新版本',
        message: [
          `当前版本：v${appInfo.versionName}`,
          `最新版本：v${latestVersion}`,
          release.body ? `更新说明：\n${limitText(release.body, 500)}` : '更新说明：未提供更新说明',
          `安装包名称：${apkAsset.name}`,
        ].join('\n\n'),
        actions: [
          { label: '稍后', style: 'muted', onPress: () => setDialog(null) },
          {
            label: '立即下载',
            style: 'primary',
            onPress: () => {
              setDialog(null);
              void downloadLatestUpdate(apkAsset.browser_download_url!, latestVersion, apkAsset.name!);
            },
          },
        ],
      });
    } catch (error) {
      console.warn('检查更新失败', error);
      showInfoDialog('检查失败', `无法获取最新版本信息。\n${error instanceof Error ? error.message : ''}`.trim());
    } finally {
      setUpdateState('idle');
    }
  }

  async function downloadLatestUpdate(url: string, version: string, fileName: string) {
    setUpdateState('downloading');
    try {
      const update = await downloadUpdate({ url, version, fileName });
      setDownloadedUpdate(update);
      setDialog({
        title: '已下载新版本',
        message: `已下载版本号：v${update.versionName}`,
        actions: downloadedUpdateActions(update),
      });
    } catch (error) {
      console.warn('下载更新失败', error);
      showInfoDialog('下载失败', error instanceof Error && error.message ? error.message : '无法下载更新安装包。');
    } finally {
      setUpdateState('idle');
    }
  }

  function showDownloadedUpdateDialog(update: DownloadedUpdate) {
    setDialog({
      title: '已下载新版本',
      message: `已下载版本号：v${update.versionName}\n安装包名称：${update.fileName}`,
      actions: downloadedUpdateActions(update),
    });
  }

  function downloadedUpdateActions(update: DownloadedUpdate) {
    return [
      { label: '稍后', style: 'muted' as const, onPress: () => setDialog(null) },
      {
        label: '删除安装包',
        style: 'secondary' as const,
        onPress: () => {
          setDialog(null);
          void deleteLocalUpdate();
        },
      },
      {
        label: '立即安装',
        style: 'primary' as const,
        onPress: () => {
          setDialog(null);
          void installLocalUpdate(update);
        },
      },
    ];
  }

  async function deleteLocalUpdate() {
    try {
      const deleted = await deleteDownloadedUpdate();
      setDownloadedUpdate(null);
      showInfoDialog(deleted ? '已删除安装包' : '已删除安装包', '已删除安装包，可重新检查更新。');
    } catch (error) {
      console.warn('删除安装包失败', error);
      showInfoDialog('删除失败', '删除失败。');
    }
  }

  async function installLocalUpdate(update: DownloadedUpdate) {
    try {
      const result = await installDownloadedUpdate();
      if (result.status === 'needsPermission') {
        showInfoDialog('需要安装权限', '请在系统设置中允许本应用安装未知应用。返回后再次点击“已下载新版本”继续安装。');
        return;
      }
      setDownloadedUpdate(update);
    } catch (error) {
      console.warn('打开系统安装器失败', error);
      showInfoDialog('安装失败', error instanceof Error && error.message ? error.message : '无法打开系统安装器。');
    }
  }

  function showInfoDialog(title: string, message: string) {
    setDialog({
      title,
      message,
      actions: [{ label: '知道了', style: 'primary', onPress: () => setDialog(null) }],
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.navigationHeader}>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>返回</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>更多</Text>
          <Text style={styles.pageSubtitle}>应用信息、说明文档和更新入口</Text>
        </View>
      </View>

      <View style={styles.moreStaticContent}>
        <View style={styles.aboutHero}>
          <Image source={require('../../assets/icon.png')} style={styles.aboutIcon} />
          <Text style={styles.aboutName}>EXIF助手</Text>
          <Text style={styles.aboutVersion}>版本：v{appInfo.versionName}</Text>
        </View>

        <View style={styles.moreList}>
          <MoreListItem first title="软件介绍" subtitle="了解 EXIF助手 是什么、能做什么。" onPress={onOpenSoftwareIntro} />
          <MoreListItem title="使用帮助" subtitle="查看主要页面和常用操作说明。" onPress={onOpenUsageHelp} />
          <MoreListItem title="隐私政策" subtitle="查看数据、权限、本地存储和联网说明。" onPress={onOpenPrivacyPolicy} />
          <MoreListItem title="版本记录" subtitle="查看用户可感知的更新历史。" onPress={onOpenVersionHistory} />
          <MoreListItem
            disabled={updateState !== 'idle'}
            title="检查更新"
            subtitle="联网检查 GitHub 最新发布版本。"
            value={updateLabel}
            onPress={handleUpdatePress}
          />
          <MoreListItem title="项目主页" subtitle="使用系统浏览器打开 GitHub 项目页。" onPress={openProjectHome} />
        </View>
      </View>

      <ActionDialog dialog={dialog} onClose={() => setDialog(null)} />
    </View>
  );
}

function MoreListItem({
  disabled,
  first,
  onPress,
  subtitle,
  title,
  value,
}: {
  disabled?: boolean;
  first?: boolean;
  onPress: () => void;
  subtitle: string;
  title: string;
  value?: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.moreListItem,
        first ? styles.moreListItemFirst : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabledButton : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.moreListTextBlock}>
        <Text style={styles.moreListTitle}>{title}</Text>
        <Text style={styles.moreListSubtitle}>{subtitle}</Text>
      </View>
      {value ? <Text style={styles.moreListValue}>{value}</Text> : <Text style={styles.moreArrow}>›</Text>}
    </Pressable>
  );
}

function ActionDialog({ dialog, onClose }: { dialog: ActionDialogState; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={dialog != null} onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <View style={[styles.dialogIcon, styles.dialogIconInfo]}>
            <Text style={styles.dialogIconText}>i</Text>
          </View>
          <Text style={styles.dialogTitle}>{dialog?.title}</Text>
          <Text style={styles.dialogMessage}>{dialog?.message}</Text>
          <View style={styles.dialogStackActions}>
            {dialog?.actions.map((action) => (
              <Pressable key={action.label} style={({ pressed }) => [dialogButtonStyle(action.style), pressed ? styles.pressed : null]} onPress={action.onPress}>
                <Text style={dialogButtonTextStyle(action.style)}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function dialogButtonStyle(style: ActionStyle = 'primary') {
  if (style === 'secondary') {
    return styles.dialogSecondaryButton;
  }
  if (style === 'muted') {
    return styles.dialogMutedButton;
  }
  return styles.dialogPrimaryActionButton;
}

function dialogButtonTextStyle(style: ActionStyle = 'primary') {
  if (style === 'secondary') {
    return styles.dialogSecondaryButtonText;
  }
  if (style === 'muted') {
    return styles.dialogMutedButtonText;
  }
  return styles.dialogButtonText;
}

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, '');
}

function compareSemanticVersions(left: string, right: string) {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue > rightValue) {
      return 1;
    }
    if (leftValue < rightValue) {
      return -1;
    }
  }
  return 0;
}

function versionParts(version: string) {
  return normalizeVersion(version)
    .split(/[.+-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

function limitText(text: string, maxLength: number) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}...`;
}
