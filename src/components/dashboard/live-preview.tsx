"use client";

import { WidgetConfig } from "@/types/widget";
import { useEffect, useRef } from "react";

interface LivePreviewProps {
  config: WidgetConfig;
}

export function LivePreview({ config }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous widget
    const existingWidget = document.getElementById("preview-chat-widget-container");
    if (existingWidget) {
      existingWidget.remove();
    }

    // Inject the widget config
    (window as unknown as Record<string, unknown>).PreviewChatWidgetConfig = {
      widgetId: config.id,
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

    // Create container for widget
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "preview-chat-widget-container";
    containerRef.current.appendChild(widgetContainer);

    // Create shadow root for style isolation
    const shadow = widgetContainer.attachShadow({ mode: "open" });

    // Widget state
    let isOpen = true;
    const messages: Array<{ role: string; content: string; timestamp: string }> = [];

    // Add initial message if enabled
    if (config.behavior.showInitialMessage && config.behavior.initialMessage) {
      messages.push({
        role: "assistant",
        content: config.behavior.initialMessage,
        timestamp: new Date().toISOString(),
      });
    }

    const position = config.style.position || "right";

    // CSS Styles
    const styles = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .widget-button {
        position: fixed;
        bottom: 20px;
        ${position}: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.style.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        z-index: 9998;
      }

      .widget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .widget-button svg {
        width: 28px;
        height: 28px;
        fill: ${config.style.secondaryColor};
      }

      .chat-window {
        position: fixed;
        bottom: 20px;
        ${position}: 20px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 40px);
        background: ${config.style.backgroundColor};
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: ${config.style.fontFamily};
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }

      .chat-header {
        background: ${config.style.primaryColor};
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-logo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${config.style.secondaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .chat-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .chat-logo svg {
        width: 20px;
        height: 20px;
        fill: ${config.style.primaryColor};
      }

      .chat-title {
        color: white;
        font-size: 16px;
        font-weight: 600;
        font-family: ${config.style.fontFamily};
      }

      .chat-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        font-family: ${config.style.fontFamily};
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background 0.2s;
      }

      .close-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .close-button svg {
        width: 20px;
        height: 20px;
        fill: white;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .welcome-section {
        text-align: center;
        padding: 20px 0;
      }

      .welcome-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: ${config.style.secondaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
      }

      .welcome-avatar svg {
        width: 24px;
        height: 24px;
        fill: ${config.style.primaryColor};
      }

      .welcome-text {
        font-size: 18px;
        font-weight: 600;
        color: ${config.style.fontColor};
        margin-bottom: 4px;
        font-family: ${config.style.fontFamily};
      }

      .response-time {
        font-size: 13px;
        color: #6b7280;
        font-family: ${config.style.fontFamily};
      }

      .message {
        display: flex;
        gap: 8px;
        max-width: 85%;
      }

      .message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${config.style.secondaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .message-avatar svg {
        width: 14px;
        height: 14px;
        fill: ${config.style.primaryColor};
      }

      .message-content {
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        color: ${config.style.fontColor};
        background: #f3f4f6;
        border-bottom-left-radius: 4px;
        font-family: ${config.style.fontFamily};
      }

      .chat-input-area {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: ${config.style.backgroundColor};
      }

      .chat-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .chat-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        padding: 12px 16px;
        font-size: 14px;
        font-family: ${config.style.fontFamily};
        color: ${config.style.fontColor};
        outline: none;
        transition: border-color 0.2s;
      }

      .chat-input:focus {
        border-color: ${config.style.primaryColor};
      }

      .chat-input::placeholder {
        color: #9ca3af;
      }

      .send-button {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${config.style.primaryColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, transform 0.2s;
      }

      .send-button:hover {
        transform: scale(1.05);
      }

      .send-button svg {
        width: 20px;
        height: 20px;
        fill: white;
      }

      .powered-by {
        text-align: center;
        padding: 8px;
        font-size: 11px;
        color: #9ca3af;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    // SVG Icons
    const icons = {
      chat: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    };

    // Render function
    function render() {
      let html = `<style>${styles}</style>`;

      if (isOpen) {
        html += `
          <div class="chat-window">
            <div class="chat-header">
              <div class="chat-header-info">
                <div class="chat-logo">
                  ${
                    config.branding.logo
                      ? `<img src="${config.branding.logo}" alt="Logo">`
                      : icons.chat
                  }
                </div>
                <div>
                  <div class="chat-title">${config.branding.name || "Chat"}</div>
                  <div class="chat-subtitle">Online</div>
                </div>
              </div>
              <button class="close-button" id="close-btn">
                ${icons.close}
              </button>
            </div>

            <div class="chat-messages">
              <div class="welcome-section">
                <div class="welcome-avatar">${icons.chat}</div>
                <div class="welcome-text">${config.branding.welcomeText}</div>
                <div class="response-time">${config.branding.responseTimeText}</div>
              </div>

              ${messages
                .map(
                  (msg) => `
                <div class="message">
                  <div class="message-avatar">${icons.chat}</div>
                  <div class="message-content">${msg.content}</div>
                </div>
              `
                )
                .join("")}
            </div>

            <div class="chat-input-area">
              <div class="chat-input-wrapper">
                <input
                  type="text"
                  class="chat-input"
                  placeholder="Type a message..."
                  disabled
                >
                <button class="send-button">
                  ${icons.send}
                </button>
              </div>
            </div>

            <div class="powered-by">
              Powered by BOTiZ
            </div>
          </div>
        `;
      } else {
        html += `
          <button class="widget-button" id="open-btn">
            ${icons.chat}
          </button>
        `;
      }

      shadow.innerHTML = html;

      // Add event listeners
      const closeBtn = shadow.getElementById("close-btn");
      const openBtn = shadow.getElementById("open-btn");

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          isOpen = false;
          render();
        });
      }

      if (openBtn) {
        openBtn.addEventListener("click", () => {
          isOpen = true;
          render();
        });
      }
    }

    // Initial render
    render();

    // Cleanup
    return () => {
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, [config]);

  return (
    <div className="bg-background-elevated rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-primary">Widget Preview</span>
      </div>

      {/* Preview Container */}
      <div ref={containerRef} className="flex-1 bg-background-app rounded-lg overflow-hidden relative">
        {/* Demo background content */}
        <div className="absolute inset-0 p-8">
          <div className="h-5 w-3/5 bg-background-card rounded mb-2" />
          <div className="h-3 w-full bg-background-card rounded mb-1" />
          <div className="h-3 w-4/5 bg-background-card rounded mb-4" />
          <div className="h-24 w-full bg-background-card rounded mb-2" />
          <div className="h-3 w-full bg-background-card rounded mb-1" />
          <div className="h-3 w-3/4 bg-background-card rounded" />
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-text-secondary">
          Widget preview • Not interactive
        </p>
      </div>
    </div>
  );
}
