import { cloneTagGroups } from '../metadata/exifTags';

export function hasMetadataValue(metadata: Record<string, string>, tag: string) {
  return metadata[tag] != null && metadata[tag] !== '';
}

export function tagLabel(tag: string) {
  return cloneTagGroups.flatMap((group) => group.tags).find((item) => item.tag === tag)?.label || tag;
}
