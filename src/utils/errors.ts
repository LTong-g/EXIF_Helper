function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function toUserFacingMessage(error: unknown, context: 'read' | 'pickTarget' | 'clone') {
  const rawMessage = getErrorMessage(error);
  const message = rawMessage.toLowerCase();

  if (message.includes('unable to open') || message.includes('无法打开') || message.includes('open failed')) {
    return '无法打开这张照片。请确认照片仍在本机、没有被移动，并重新选择。';
  }
  if (message.includes('permission') || message.includes('denied') || message.includes('权限')) {
    return '没有获得照片访问权限。请重新选择照片，或检查系统照片权限。';
  }
  if (message.includes('unsupported') || message.includes('not supported') || message.includes('暂不支持')) {
    return '当前版本暂不支持这张照片的格式或元数据结构。';
  }
  if (message.includes('no supported exif tags selected')) {
    return '没有可写入的元数据项。请回到克隆内容页面至少勾选一项。';
  }
  if (message.includes('selected exif tags have no source values')) {
    return '勾选的元数据项在源照片中没有可用值。请回到克隆内容页面调整勾选项。';
  }
  if (message.includes('校验失败')) {
    return '元数据写入后有部分标签未通过校验。请减少勾选项后重试，或换一张目标照片。';
  }

  if (context === 'read') {
    return '无法读取这张照片的元数据。请换一张包含元数据的原图。';
  }
  if (context === 'pickTarget') {
    return '没有完成目标照片选择。请重新选择照片。';
  }
  return '没有完成克隆。请检查源照片、目标照片和勾选项后重试。';
}
