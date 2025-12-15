"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { LivePreview } from "@/components/dashboard/live-preview";
import { ConfigSection } from "@/components/dashboard/config-section";
import { SourcesSection } from "@/components/dashboard/sources-section";
import { ContentSection } from "@/components/dashboard/content-section";
import { AppearanceSection } from "@/components/dashboard/appearance-section";
import { ExportSection } from "@/components/dashboard/export-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWidget, updateWidget } from "@/lib/storage";
import { WidgetConfig } from "@/types/widget";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function WidgetEditorPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.id as string;

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [activeSection, setActiveSection] = useState("config");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const widget = getWidget(widgetId);
    if (widget) {
      // Migrate old widgets that don't have the new ai and contextSources fields
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
    } else {
      router.push("/");
    }
  }, [widgetId, router]);

  const handleChange = useCallback((updates: Partial<WidgetConfig>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    updateWidget(widgetId, config);
    setHasChanges(false);
    setIsSaving(false);
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-app flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-background-card border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-background-hover rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Input
                value={config.name}
                onChange={(e) => handleChange({ name: e.target.value })}
                className="text-lg font-semibold border-0 bg-transparent px-0 focus:ring-0 w-64 text-text-primary"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="min-w-[140px]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Editor Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-background-app">
            <div className="max-w-2xl">
              {activeSection === "config" && (
                <ConfigSection config={config} onChange={handleChange} />
              )}
              {activeSection === "sources" && (
                <SourcesSection config={config} onChange={handleChange} />
              )}
              {activeSection === "content" && (
                <ContentSection config={config} onChange={handleChange} />
              )}
              {activeSection === "appearance" && (
                <AppearanceSection config={config} onChange={handleChange} />
              )}
              {activeSection === "export" && <ExportSection config={config} />}
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="w-[380px] border-l border-border-subtle bg-background-card">
            <LivePreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
