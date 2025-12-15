"use client";

import { cn } from "@/lib/utils";
import {
  Settings,
  MessageSquare,
  Palette,
  Code,
  CircleDot,
  Database,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: "AI Config", href: "/widget", icon: Settings, section: "config" },
  { name: "Sources", href: "/widget", icon: Database, section: "sources" },
  { name: "Content", href: "/widget", icon: MessageSquare, section: "content" },
  { name: "Appearance", href: "/widget", icon: Palette, section: "appearance" },
  { name: "Export", href: "/widget", icon: Code, section: "export" },
];

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = "config", onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-background-card border-r border-border-subtle flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-all">
            <MessageSquare className="w-6 h-6 text-background-app" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-text-primary">BOTiZ</h1>
            <p className="text-xs text-text-secondary">Builder v2.0</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = activeSection === item.section;
          return (
            <button
              key={item.name}
              onClick={() => onSectionChange?.(item.section)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all text-left",
                isActive
                  ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-border-accent shadow-glow"
                  : "text-text-secondary hover:bg-background-hover hover:text-text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <div className="flex-1">
                <span>{item.name}</span>
                {item.section === "config" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    AI provider & settings
                  </p>
                )}
                {item.section === "sources" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Websites & PDF context
                  </p>
                )}
                {item.section === "content" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Customize messages & FAQs
                  </p>
                )}
                {item.section === "appearance" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Match your brand identity
                  </p>
                )}
                {item.section === "export" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Get your embed code
                  </p>
                )}
              </div>
              {isActive && <span className="text-primary">›</span>}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-border-subtle bg-background-secondary">
        <div className="flex items-center gap-2 text-sm">
          <CircleDot className="w-4 h-4 text-status-success animate-pulse" />
          <span className="font-medium text-text-primary">System Status</span>
        </div>
        <p className="text-xs text-text-secondary mt-1 ml-6">
          All systems operational.
        </p>
        <p className="text-xs text-status-success ml-6">Ready to deploy.</p>
      </div>
    </aside>
  );
}
