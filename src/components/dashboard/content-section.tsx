"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WidgetConfig } from "@/types/widget";
import { Plus, Trash2, Loader2, X, Image as ImageIcon } from "lucide-react";

interface ContentSectionProps {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

export function ContentSection({ config, onChange }: ContentSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFaq = () => {
    onChange({
      faq: [...config.faq, { question: "", answer: "" }],
    });
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaq = [...config.faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    onChange({ faq: newFaq });
  };

  const removeFaq = (index: number) => {
    onChange({
      faq: config.faq.filter((_, i) => i !== index),
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange({
        branding: { ...config.branding, logo: data.data.url },
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeLogo = () => {
    onChange({
      branding: { ...config.branding, logo: "" },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Content</h2>
        <p className="text-sm text-text-secondary mt-1">
          Customize messages and frequently asked questions.
        </p>
      </div>

      {/* Branding */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Branding & Messages</h3>

        <Input
          label="Widget Name"
          placeholder="My Support Bot"
          value={config.branding.name}
          onChange={(e) =>
            onChange({
              branding: { ...config.branding, name: e.target.value },
            })
          }
        />

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Logo
          </label>

          {config.branding.logo ? (
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-border-subtle">
                <img
                  src={config.branding.logo}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary truncate max-w-xs">
                  {config.branding.logo}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  className="text-red-500 hover:text-red-700 mt-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-border-subtle rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-text-secondary">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                    <p className="text-sm text-text-primary">Click to upload logo</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Auto-resized to 80x80px. PNG, JPG, WebP, or GIF
                    </p>
                  </>
                )}
              </button>
              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        <Input
          label="Welcome Text"
          placeholder="Hi there 👋"
          value={config.branding.welcomeText}
          onChange={(e) =>
            onChange({
              branding: { ...config.branding, welcomeText: e.target.value },
            })
          }
        />

        <Input
          label="Response Time Text"
          placeholder="We typically reply in a few minutes"
          value={config.branding.responseTimeText}
          onChange={(e) =>
            onChange({
              branding: { ...config.branding, responseTimeText: e.target.value },
            })
          }
        />
      </div>

      {/* Behavior */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Behavior</h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Show Initial Message</p>
            <p className="text-xs text-text-secondary">
              Display an automated greeting when the chat opens
            </p>
          </div>
          <Switch
            checked={config.behavior.showInitialMessage}
            onChange={(checked) =>
              onChange({
                behavior: { ...config.behavior, showInitialMessage: checked },
              })
            }
          />
        </div>

        {config.behavior.showInitialMessage && (
          <Textarea
            label="Initial Message"
            placeholder="Hello! How can I help you today?"
            value={config.behavior.initialMessage}
            onChange={(e) =>
              onChange({
                behavior: { ...config.behavior, initialMessage: e.target.value },
              })
            }
            rows={2}
          />
        )}

        <Input
          label="Popup Message"
          placeholder="👋 Can I help you with something?"
          value={config.behavior.popupMessage}
          onChange={(e) =>
            onChange({
              behavior: { ...config.behavior, popupMessage: e.target.value },
            })
          }
          hint="Shown as a preview bubble before the user opens the chat"
        />

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Sound Enabled</p>
            <p className="text-xs text-text-secondary">
              Play a sound when new messages arrive
            </p>
          </div>
          <Switch
            checked={config.behavior.soundEnabled}
            onChange={(checked) =>
              onChange({
                behavior: { ...config.behavior, soundEnabled: checked },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Open by Default</p>
            <p className="text-xs text-text-secondary">
              Automatically open the chat widget on page load
            </p>
          </div>
          <Switch
            checked={config.behavior.isOpenByDefault}
            onChange={(checked) =>
              onChange({
                behavior: { ...config.behavior, isOpenByDefault: checked },
              })
            }
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-text-primary">FAQ Quick Replies</h3>
            <p className="text-sm text-text-secondary">
              Add frequently asked questions for quick access
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addFaq}>
            <Plus className="w-4 h-4" />
            Add FAQ
          </Button>
        </div>

        {config.faq.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No FAQs added yet. Click &quot;Add FAQ&quot; to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {config.faq.map((item, index) => (
              <div
                key={index}
                className="bg-background-card rounded-lg p-4 border border-border-subtle space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Question..."
                      value={item.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer..."
                      value={item.answer}
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaq(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
