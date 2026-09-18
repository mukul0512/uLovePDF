import type { ComponentType } from 'react';
import type { IconProps } from '@/components/ui/icon/IconBase';
import {
  CompressIcon,
  MergeIcon,
  PenIcon,
  RotateIcon,
  SplitIcon,
} from '@/components/ui/icon/icons';
import type { ToolIconKey } from '@/constants/tools';

/**
 * Maps the tool registry's icon keys onto components.
 *
 * This lookup exists because `constants/tools.ts` must stay free of React.
 * The `Record` is exhaustive, so adding a key to `ToolIconKey` without an
 * icon here is a compile error rather than a blank space on the page.
 */
export const TOOL_ICONS: Record<ToolIconKey, ComponentType<IconProps>> = {
  merge: MergeIcon,
  split: SplitIcon,
  rotate: RotateIcon,
  compress: CompressIcon,
  edit: PenIcon,
};
