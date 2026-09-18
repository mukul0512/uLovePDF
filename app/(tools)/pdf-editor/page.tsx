import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import { ToolPageShell } from '@/components/tools/ToolPageShell';
import { buildToolMetadata } from '@/config/metadata';
import { TOOLS } from '@/constants/tools';

export const metadata = buildToolMetadata(TOOLS.editor);

export default function PdfEditorPage() {
  return (
    <ToolPageShell tool={TOOLS.editor}>
      <EditorWorkspace />
    </ToolPageShell>
  );
}
