'use client';

import { Button } from '@/components/ui/Button';
import type { RotationDegrees } from '@/types/document';

const ROTATE_OPTIONS: readonly { degrees: Exclude<RotationDegrees, 0>; label: string }[] = [
  { degrees: 90, label: '90° clockwise' },
  { degrees: 180, label: '180°' },
  { degrees: 270, label: '90° anticlockwise' },
];

interface RotateAnglePickerProps {
  value: Exclude<RotationDegrees, 0>;
  onChange: (value: Exclude<RotationDegrees, 0>) => void;
  disabled?: boolean;
}

/** Quarter-turn choices for the rotate tool. The editor handles per-page turns. */
export function RotateAnglePicker({ value, onChange, disabled = false }: RotateAnglePickerProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-muted mb-2 text-sm">Turn every page</legend>
      <div role="group" className="flex flex-wrap gap-2">
        {ROTATE_OPTIONS.map((option) => (
          <Button
            key={option.degrees}
            type="button"
            variant={value === option.degrees ? 'secondary' : 'ghost'}
            size="sm"
            disabled={disabled}
            aria-pressed={value === option.degrees}
            onClick={() => onChange(option.degrees)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
