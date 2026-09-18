import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { buildToolMetadata } from '@/config/metadata';
import { TOOLS } from '@/constants/tools';

export const metadata = buildToolMetadata(TOOLS.merge);

export default function MergePdfPage() {
  return <ToolPageShell tool={TOOLS.merge} />;
}
