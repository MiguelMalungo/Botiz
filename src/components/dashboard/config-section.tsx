"use client";

import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WidgetConfig } from "@/types/widget";

interface ConfigSectionProps {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude)" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Affordable)" },
  { value: "gpt-4o", label: "GPT-4o (Most Capable)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Budget)" },
];

const ANTHROPIC_MODELS = [
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast & Affordable)" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Balanced)" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus (Most Capable)" },
];

export function ConfigSection({ config, onChange }: ConfigSectionProps) {
  const models = config.ai.provider === "openai" ? OPENAI_MODELS : ANTHROPIC_MODELS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">AI Configuration</h2>
        <p className="text-sm text-text-secondary mt-1">
          Configure the AI that powers your chatbot responses.
        </p>
      </div>

      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">AI Provider Settings</h3>

        <Select
          label="AI Provider"
          value={config.ai.provider}
          onChange={(value) => {
            const newProvider = value as "openai" | "anthropic";
            const defaultModel = newProvider === "openai" ? "gpt-4o-mini" : "claude-3-haiku-20240307";
            onChange({
              ai: { ...config.ai, provider: newProvider, model: defaultModel },
            });
          }}
          options={AI_PROVIDERS}
        />

        <Select
          label="Model"
          value={config.ai.model}
          onChange={(value) =>
            onChange({
              ai: { ...config.ai, model: value },
            })
          }
          options={models}
        />

        <div className="p-4 bg-status-infoLight rounded-lg border border-status-info/30">
          <p className="text-sm text-text-primary">
            <strong>Note:</strong> API keys are stored securely on the server. Your chatbot will use
            the AI provider configured in the server environment variables.
          </p>
        </div>
      </div>

      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Business Context</h3>
        <p className="text-sm text-text-secondary">
          Help the AI understand your business to provide better responses.
        </p>

        <Textarea
          label="Business Description"
          placeholder="Describe your business, products, and services. For example: 'We are a software company that builds productivity tools for remote teams. Our main product is TaskFlow, a project management app.'"
          value={config.ai.businessContext}
          onChange={(e) =>
            onChange({
              ai: { ...config.ai, businessContext: e.target.value },
            })
          }
          rows={4}
          hint="This helps the AI understand your business and provide relevant answers"
        />

        <Textarea
          label="Custom System Prompt (optional)"
          placeholder="Add custom instructions for the AI. For example: 'Always be friendly and use emojis. Never mention competitor products.'"
          value={config.ai.systemPrompt}
          onChange={(e) =>
            onChange({
              ai: { ...config.ai, systemPrompt: e.target.value },
            })
          }
          rows={3}
          hint="Advanced: Add custom instructions to fine-tune AI behavior"
        />

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-text-primary">Restrict to Business Topics</p>
            <p className="text-xs text-text-secondary">
              Only answer questions related to your business. Redirects off-topic questions.
            </p>
          </div>
          <Switch
            checked={config.ai.restrictToBusinessTopics}
            onChange={(checked) =>
              onChange({
                ai: { ...config.ai, restrictToBusinessTopics: checked },
              })
            }
          />
        </div>
      </div>

      <div className="bg-background-card rounded-lg p-4 border border-border-subtle">
        <h4 className="text-sm font-medium text-text-primary mb-2">
          How It Works
        </h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>The AI uses your business description and context sources to answer questions</li>
          <li>With &quot;Restrict to Business Topics&quot; enabled, off-topic questions are politely redirected</li>
          <li>Add context sources (websites, PDFs) in the Sources tab for more detailed knowledge</li>
          <li>API keys are stored securely on the server - never exposed to clients</li>
        </ul>
      </div>
    </div>
  );
}
