export type PickedPhoto = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  width: number;
  height: number;
};

export type CloneTagDefinition = {
  tag: string;
  label: string;
  defaultSelected?: boolean;
  riskyByDefault?: boolean;
};

export type CloneTagGroup = {
  id: string;
  title: string;
  tags: CloneTagDefinition[];
};

export type ApplyCloneRequest = {
  sourceUri: string;
  targetUris: string[];
  tags: string[];
  pngOutputMode?: 'png' | 'jpeg';
};

export type CloneResult = {
  targetUri: string;
  outputUri?: string;
  fileName?: string;
  success: boolean;
  error?: string;
  warning?: string;
  failedTags?: string[];
};
