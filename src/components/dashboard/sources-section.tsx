"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WidgetConfig, ContextSource } from "@/types/widget";
import { Globe, FileText, Trash2, Plus, Loader2, AlertCircle, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface SourcesSectionProps {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

export function SourcesSection({ config, onChange }: SourcesSectionProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addSource = (source: Omit<ContextSource, "id" | "addedAt">) => {
    const newSource: ContextSource = {
      ...source,
      id: uuidv4(),
      addedAt: new Date().toISOString(),
    };
    onChange({
      contextSources: [...config.contextSources, newSource],
    });
  };

  const removeSource = (id: string) => {
    onChange({
      contextSources: config.contextSources.filter((s) => s.id !== id),
    });
  };

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim()) return;

    setIsLoadingWebsite(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/context/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch website");
      }

      addSource({
        type: "website",
        name: data.data.name,
        url: websiteUrl,
        content: data.data.content,
      });

      setWebsiteUrl("");
      setSuccess(`Added website: ${data.data.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add website");
    } finally {
      setIsLoadingWebsite(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingPdf(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/context/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process PDF");
      }

      addSource({
        type: "pdf",
        name: data.data.name,
        content: data.data.content,
      });

      setSuccess(`Added PDF: ${data.data.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add PDF");
    } finally {
      setIsLoadingPdf(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const websiteCount = config.contextSources.filter((s) => s.type === "website").length;
  const pdfCount = config.contextSources.filter((s) => s.type === "pdf").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Context Sources</h2>
        <p className="text-sm text-text-secondary mt-1">
          Add websites and PDFs to give your chatbot knowledge about your business.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Add Website */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-text-primary">Add Website</h3>
          <span className="text-xs text-text-secondary">({websiteCount}/5 websites)</span>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/about"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isLoadingWebsite || websiteCount >= 5}
          />
          <Button
            onClick={handleAddWebsite}
            disabled={!websiteUrl.trim() || isLoadingWebsite || websiteCount >= 5}
          >
            {isLoadingWebsite ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </Button>
        </div>

        <p className="text-xs text-text-secondary">
          Enter a URL to extract content. Works best with text-heavy pages like About, FAQ, or documentation.
        </p>
      </div>

      {/* Upload PDF */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-text-primary">Upload PDF</h3>
          <span className="text-xs text-text-secondary">({pdfCount}/1 PDF)</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              disabled={isLoadingPdf || pdfCount >= 1}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isLoadingPdf || pdfCount >= 1
                  ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "border-border-subtle hover:border-primary hover:bg-primary/5"
              }`}
            >
              {isLoadingPdf ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-text-secondary">Processing PDF...</span>
                </div>
              ) : (
                <>
                  <FileText className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                  <p className="text-sm text-text-primary">
                    {pdfCount >= 1 ? "PDF limit reached" : "Click to upload PDF"}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Max 10MB, text-based PDFs only
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Current Sources */}
      <div className="bg-background-secondary rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-text-primary">Current Sources</h3>

        {config.contextSources.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No sources added yet. Add websites or a PDF to provide context for your chatbot.
          </div>
        ) : (
          <div className="space-y-3">
            {config.contextSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 bg-background-card rounded-lg border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  {source.type === "website" ? (
                    <Globe className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{source.name}</p>
                    <p className="text-xs text-text-secondary">
                      {source.type === "website" && source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {source.url}
                        </a>
                      ) : (
                        `${(source.content?.length || 0).toLocaleString()} characters`
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSource(source.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-status-infoLight rounded-lg p-4 border border-status-info/30">
        <h4 className="text-sm font-medium text-text-primary mb-2">Tips for Best Results</h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Add your FAQ, pricing, and product/service pages</li>
          <li>PDF works best with text-based documents (not scanned images)</li>
          <li>Content is processed and stored locally - no data leaves your control</li>
          <li>More context = better answers, but keep it focused and relevant</li>
        </ul>
      </div>
    </div>
  );
}
