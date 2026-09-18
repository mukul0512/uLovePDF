import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { buildToolMetadata } from '@/config/metadata';
import { TOOLS } from '@/constants/tools';

export const metadata = buildToolMetadata(TOOLS.rotate);

export default function RotatePdfPage() {
  return <ToolPageShell tool={TOOLS.rotate} />;
}
