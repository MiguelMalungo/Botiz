"use client";

import { Button } from "@/components/ui/button";
import { WidgetConfig } from "@/types/widget";
import { Check, Copy, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ExportSectionProps {
  config: WidgetConfig;
}

export function ExportSection({ config }: ExportSectionProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Prepare context sources for embedding (strip content for security, keep metadata)
  const contextSourcesForEmbed = config.contextSources.map((source) => ({
    type: source.type,
    name: source.name,
    content: source.content, // Include content since it's needed for RAG
  }));

  const embedCode = `<!-- BOTiZ Chat Widget -->
<script>
  window.ChatWidgetConfig = {
    "widgetId": "${config.id}",
    "baseUrl": "${baseUrl}",
    "ai": {
      "provider": "${config.ai.provider}",
      "model": "${config.ai.model}",
      "systemPrompt": ${JSON.stringify(config.ai.systemPrompt)},
      "businessContext": ${JSON.stringify(config.ai.businessContext)},
      "restrictToBusinessTopics": ${config.ai.restrictToBusinessTopics}
    },
    "contextSources": ${JSON.stringify(contextSourcesForEmbed)},
    "branding": {
      "logo": "${config.branding.logo}",
      "name": "${config.branding.name}",
      "welcomeText": "${config.branding.welcomeText}",
      "responseTimeText": "${config.branding.responseTimeText}"
    },
    "style": {
      "primaryColor": "${config.style.primaryColor}",
      "secondaryColor": "${config.style.secondaryColor}",
      "position": "${config.style.position}",
      "backgroundColor": "${config.style.backgroundColor}",
      "fontColor": "${config.style.fontColor}",
      "fontFamily": "${config.style.fontFamily}"
    },
    "behavior": {
      "isOpenByDefault": ${config.behavior.isOpenByDefault},
      "popupMessage": "${config.behavior.popupMessage}",
      "autoOpenDelay": ${config.behavior.autoOpenDelay},
      "animation": "${config.behavior.animation}",
      "soundEnabled": ${config.behavior.soundEnabled},
      "showInitialMessage": ${config.behavior.showInitialMessage},
      "initialMessage": "${config.behavior.initialMessage}"
    },
    "faq": ${JSON.stringify(config.faq)}
  };
</script>
<script src="${baseUrl}/widget/loader.js" async></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAiConfig = config.ai.businessContext || config.ai.systemPrompt;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Export</h2>
        <p className="text-sm text-text-secondary mt-1">
          Get the embed code for your website.
        </p>
      </div>

      {/* Embed Code */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            {"<>"} Embed Code
          </span>
        </div>

        <div className="relative">
          <div className="bg-background-app rounded-lg overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-text-muted hover:text-white hover:bg-gray-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            {/* Code */}
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto max-h-[400px] overflow-y-auto">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-background-card rounded-lg p-4 border border-border-subtle">
        <h4 className="text-sm font-medium text-text-primary mb-2">
          Installation Instructions
        </h4>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Copy the embed code above</li>
          <li>
            Paste it into your website&apos;s HTML, just before the closing{" "}
            <code className="bg-background-elevated px-2 py-0.5 rounded text-text-primary border border-border-subtle">&lt;/body&gt;</code> tag
          </li>
          <li>Save and deploy your website</li>
          <li>The chat widget will appear on your site!</li>
        </ol>
      </div>

      {/* Configuration Warning */}
      {!hasAiConfig && (
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-500 mb-1">
                Missing Business Context
              </h4>
              <p className="text-sm text-text-secondary">
                You haven&apos;t added a business description yet. The chatbot will work,
                but it will provide better responses if you add context in the AI Config section.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Key Info */}
      <div className="bg-status-infoLight rounded-lg p-4 border border-status-info/30">
        <h4 className="text-sm font-medium text-text-primary mb-2">
          API Key Security
        </h4>
        <p className="text-sm text-text-secondary">
          Your AI API keys are stored securely on the server and never exposed in the embed code.
          The widget communicates with your BOTiZ server, which handles all AI API calls.
        </p>
      </div>

      {/* Widget Stats */}
      <div className="bg-background-card rounded-lg p-4 border border-border-subtle">
        <h4 className="text-sm font-medium text-text-primary mb-3">Widget Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">AI Provider</p>
            <p className="font-medium text-text-primary capitalize">{config.ai.provider}</p>
          </div>
          <div>
            <p className="text-text-secondary">Model</p>
            <p className="font-medium text-text-primary">{config.ai.model}</p>
          </div>
          <div>
            <p className="text-text-secondary">Context Sources</p>
            <p className="font-medium text-text-primary">{config.contextSources.length} sources</p>
          </div>
          <div>
            <p className="text-text-secondary">FAQs</p>
            <p className="font-medium text-text-primary">{config.faq.length} questions</p>
          </div>
        </div>
      </div>

      {/* Widget ID */}
      <div className="bg-background-card rounded-lg p-4 border border-border-subtle">
        <h4 className="text-sm font-medium text-text-primary mb-2">Widget ID</h4>
        <code className="text-sm bg-background-elevated px-3 py-1.5 rounded text-text-primary border border-border-subtle font-mono">
          {config.id}
        </code>
        <p className="text-xs text-text-secondary mt-2">
          Use this ID to identify your widget in analytics and API calls.
        </p>
      </div>
    </div>
  );
}
