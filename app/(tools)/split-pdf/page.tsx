import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { buildToolMetadata } from '@/config/metadata';
import { TOOLS } from '@/constants/tools';

export const metadata = buildToolMetadata(TOOLS.split);

export default function SplitPdfPage() {
  return <ToolPageShell tool={TOOLS.split} />;
}
