import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { buildToolMetadata } from '@/config/metadata';
import { TOOLS } from '@/constants/tools';

export const metadata = buildToolMetadata(TOOLS.compress);

export default function CompressPdfPage() {
  return <ToolPageShell tool={TOOLS.compress} />;
}
