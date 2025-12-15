"use client";

import { ColorPicker } from "@/components/ui/color-picker";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WidgetConfig } from "@/types/widget";

interface AppearanceSectionProps {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

const positionOptions = [
  { value: "right", label: "Bottom Right" },
  { value: "left", label: "Bottom Left" },
];

const animationOptions = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "scale", label: "Scale" },
];

const fontOptions = [
  { value: "Geist Sans", label: "Geist Sans" },
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "System UI" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
];

export function AppearanceSection({ config, onChange }: AppearanceSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Appearance</h2>
        <p className="text-sm text-text-secondary mt-1">
          Match your brand identity with custom colors and styles.
        </p>
      </div>

      {/* Branding */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Branding</h3>

        <Input
          label="Logo URL"
          type="url"
          placeholder="https://example.com/logo.png"
          value={config.branding.logo}
          onChange={(e) =>
            onChange({
              branding: { ...config.branding, logo: e.target.value },
            })
          }
          hint="Enter a direct URL to your logo image (recommended: square image, 40x40px)"
        />

        {config.branding.logo && (
          <div className="mt-2">
            <p className="text-xs text-text-secondary mb-2">Logo Preview</p>
            <div className="flex items-center gap-3">
              <img
                src={config.branding.logo}
                alt="Logo preview"
                className="w-10 h-10 rounded-full object-cover border-2 border-border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xs text-text-secondary">
                This logo will appear in the chat widget header
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Colors</h3>

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary Color"
            value={config.style.primaryColor}
            onChange={(value) =>
              onChange({
                style: { ...config.style, primaryColor: value },
              })
            }
          />

          <ColorPicker
            label="Secondary Color"
            value={config.style.secondaryColor}
            onChange={(value) =>
              onChange({
                style: { ...config.style, secondaryColor: value },
              })
            }
          />

          <ColorPicker
            label="Background Color"
            value={config.style.backgroundColor}
            onChange={(value) =>
              onChange({
                style: { ...config.style, backgroundColor: value },
              })
            }
          />

          <ColorPicker
            label="Font Color"
            value={config.style.fontColor}
            onChange={(value) =>
              onChange({
                style: { ...config.style, fontColor: value },
              })
            }
          />
        </div>
      </div>

      {/* Position & Layout */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Position & Layout</h3>

        <Select
          label="Widget Position"
          options={positionOptions}
          value={config.style.position}
          onChange={(value) =>
            onChange({
              style: {
                ...config.style,
                position: value as "left" | "right",
              },
            })
          }
        />

        <Select
          label="Animation Style"
          options={animationOptions}
          value={config.behavior.animation}
          onChange={(value) =>
            onChange({
              behavior: {
                ...config.behavior,
                animation: value as "fade" | "slide" | "scale",
              },
            })
          }
        />

        <Input
          label="Auto Open Delay (seconds)"
          type="number"
          min={0}
          max={60}
          value={config.behavior.autoOpenDelay}
          onChange={(e) =>
            onChange({
              behavior: {
                ...config.behavior,
                autoOpenDelay: parseInt(e.target.value) || 0,
              },
            })
          }
          hint="Set to 0 to disable auto-open"
        />
      </div>

      {/* Typography */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Typography</h3>

        <Select
          label="Font Family"
          options={fontOptions}
          value={config.style.fontFamily}
          onChange={(value) =>
            onChange({
              style: { ...config.style, fontFamily: value },
            })
          }
        />
      </div>

      {/* Preview Colors */}
      <div className="bg-background-secondary rounded-lg p-6">
        <h3 className="font-medium text-text-primary mb-4">Color Preview</h3>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: config.style.primaryColor }}
          >
            Primary
          </div>
          <div
            className="w-16 h-16 rounded-lg shadow-inner flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: config.style.secondaryColor }}
          >
            Secondary
          </div>
          <div
            className="w-16 h-16 rounded-lg shadow-inner border flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: config.style.backgroundColor,
              color: config.style.fontColor,
            }}
          >
            Text
          </div>
        </div>
      </div>
    </div>
  );
}
