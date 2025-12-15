"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

const presetColors = [
  "#059669", "#047857", "#10b981", "#34d399",
  "#3b82f6", "#2563eb", "#1d4ed8", "#6366f1",
  "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#000000", "#374151", "#6b7280", "#9ca3af",
];

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 w-full rounded-md border border-border px-4 py-2.5 text-sm bg-background-secondary hover:bg-background-hover hover:border-border-strong transition-all"
        >
          <span
            className="w-6 h-6 rounded border border-border-strong"
            style={{ backgroundColor: value }}
          />
          <span className="text-text-primary uppercase">{value}</span>
        </button>

        {showPicker && (
          <div className="absolute z-10 mt-1 p-3 bg-background-card rounded-md shadow-card-elevated border border-border animate-scaleIn">
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color);
                    setShowPicker(false);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-md border-2 transition-transform hover:scale-110",
                    value === color ? "border-primary scale-110 shadow-glow" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background-secondary px-2 py-1 text-sm uppercase text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="#000000"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
