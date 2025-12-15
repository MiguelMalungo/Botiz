"use client";

import { Button } from "@/components/ui/button";
import { createWidget, deleteWidget, getWidgets } from "@/lib/storage";
import { WidgetConfig } from "@/types/widget";
import { MessageSquare, Plus, Settings, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setWidgets(getWidgets());
    setIsLoading(false);
  }, []);

  const handleCreateWidget = () => {
    const newWidget = createWidget();
    setWidgets(getWidgets());
    window.location.href = `/widget/${newWidget.id}`;
  };

  const handleDeleteWidget = (id: string) => {
    if (confirm("Are you sure you want to delete this widget?")) {
      deleteWidget(id);
      setWidgets(getWidgets());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-app">
      {/* Header */}
      <header className="bg-background-card border-b border-border-subtle h-header">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-glow">
                <Image
                  src="/img/botiz_s.png"
                  alt="BOTiZ Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-text-primary">BOTiZ</h1>
                <p className="text-xs text-text-secondary">AI Chat Widget Builder</p>
              </div>
            </div>
            <Button onClick={handleCreateWidget}>
              <Plus className="w-4 h-4" />
              New Widget
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {widgets.length === 0 ? (
          /* Empty State */
          <div className="bg-background-card rounded-xl border border-border-subtle p-12 text-center shadow-card animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No widgets yet
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Create your first chat widget to add AI-powered conversations to
              your website. Configure it with your business context for intelligent
              responses.
            </p>
            <Button size="lg" onClick={handleCreateWidget}>
              <Plus className="w-5 h-5" />
              Create Your First Widget
            </Button>
          </div>
        ) : (
          /* Widget Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className="bg-background-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-card-hover hover:border-border transition-all duration-200 hover:-translate-y-1 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Widget Preview Header */}
                <div
                  className="h-24 relative"
                  style={{
                    background: `linear-gradient(135deg, ${widget.style.primaryColor}, ${widget.style.secondaryColor})`,
                  }}
                >
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {widget.branding.name || widget.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${widget.isActive ? 'bg-status-success' : 'bg-text-muted'}`} />
                        <p className="text-white/80 text-xs">
                          {widget.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary mb-1 text-lg">
                    {widget.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {widget.ai?.businessContext ? (
                      <span className="text-xs px-2 py-1 rounded-md bg-status-successLight text-status-success font-medium">
                        AI Configured
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-md bg-background-hover text-text-muted font-medium">
                        Needs setup
                      </span>
                    )}
                    {widget.contextSources?.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-md bg-status-infoLight text-status-info font-medium">
                        {widget.contextSources.length} source{widget.contextSources.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                    <span>
                      Created {new Date(widget.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/widget/${widget.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/preview/${widget.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="text-status-error hover:text-status-error hover:bg-status-errorLight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Widget Card */}
            <button
              onClick={handleCreateWidget}
              className="bg-background-card rounded-xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center text-text-secondary hover:border-primary hover:text-primary hover:bg-background-secondary transition-all duration-200 min-h-[250px] group"
            >
              <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Add New Widget</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
