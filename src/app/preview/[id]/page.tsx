"use client";

import { getWidget } from "@/lib/storage";
import { WidgetConfig } from "@/types/widget";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const params = useParams();
  const widgetId = params.id as string;
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    const widget = getWidget(widgetId);
    if (widget) {
      // Migrate old widgets
      const migratedWidget = {
        ...widget,
        ai: widget.ai || {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          systemPrompt: "",
          businessContext: "",
          restrictToBusinessTopics: true,
        },
        contextSources: widget.contextSources || [],
      };
      setConfig(migratedWidget);
    }
  }, [widgetId]);

  useEffect(() => {
    if (config) {
      // Inject the widget config with the new structure
      (window as unknown as { ChatWidgetConfig: object }).ChatWidgetConfig = {
        widgetId: config.id,
        baseUrl: window.location.origin,
        ai: config.ai,
        contextSources: config.contextSources,
        branding: config.branding,
        style: config.style,
        behavior: {
          ...config.behavior,
          isOpenByDefault: true, // Open by default in preview
        },
        faq: config.faq,
      };

      // Load the widget script
      const script = document.createElement("script");
      script.src = "/widget/loader.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup
        const widgetContainer = document.getElementById("chat-widget-container");
        if (widgetContainer) {
          widgetContainer.remove();
        }
        script.remove();
      };
    }
  }, [config]);

  if (!config) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-app">
      {/* Sample Website Content */}
      <header className="bg-background-card shadow-card border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Empty header for cleaner look */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Widget Configuration Card - Left Aligned */}
        <div className="max-w-2xl">
          <div className="bg-background-card rounded-xl p-8 shadow-card border border-border-subtle">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Widget Configuration
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Widget Name</dt>
                <dd className="text-text-primary font-medium">{config.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">AI Provider</dt>
                <dd className="text-text-primary font-medium capitalize">
                  {config.ai.provider}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Model</dt>
                <dd className="text-text-primary font-medium">
                  {config.ai.model}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Context Sources</dt>
                <dd className="text-text-primary font-medium">
                  {config.contextSources.length} sources
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-text-secondary">Primary Color</dt>
                <dd className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: config.style.primaryColor }}
                  />
                  <span className="text-text-primary font-medium uppercase">
                    {config.style.primaryColor}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Position</dt>
                <dd className="text-text-primary font-medium capitalize">
                  {config.style.position}
                </dd>
              </div>
            </dl>
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <p className="text-sm text-text-secondary text-center">
                The chat widget will appear in the {config.style.position} corner, open by default.
                <br />
                You can close it and reopen it by clicking the button.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Back to editor link */}
      <div className="fixed top-4 left-4 z-50">
        <a
          href={`/widget/${widgetId}`}
          className="flex items-center gap-2 px-4 py-2 bg-background-card rounded-md shadow-card border border-border-subtle text-base font-medium text-text-primary hover:bg-background-hover hover:border-border transition-all"
        >
          ← Back to Editor
        </a>
      </div>
    </div>
  );
}
