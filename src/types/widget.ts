export interface ContextSource {
  id: string;
  type: "website" | "pdf";
  name: string;
  url?: string; // For websites
  content?: string; // Extracted text content
  addedAt: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // AI Configuration (replaces n8n)
  ai: {
    provider: "openai" | "anthropic";
    model: string;
    systemPrompt: string;
    businessContext: string; // Description of the business/service
    restrictToBusinessTopics: boolean; // Only answer business-related questions
  };

  // Context Sources for RAG
  contextSources: ContextSource[];

  // Branding
  branding: {
    logo: string;
    name: string;
    welcomeText: string;
    responseTimeText: string;
  };

  // Style
  style: {
    primaryColor: string;
    secondaryColor: string;
    position: "left" | "right";
    backgroundColor: string;
    fontColor: string;
    fontFamily: string;
  };

  // Behavior
  behavior: {
    isOpenByDefault: boolean;
    popupMessage: string;
    autoOpenDelay: number;
    animation: "fade" | "slide" | "scale";
    soundEnabled: boolean;
    showInitialMessage: boolean;
    initialMessage: string;
  };

  // FAQ
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const defaultWidgetConfig: Omit<WidgetConfig, "id" | "createdAt" | "updatedAt"> = {
  name: "My Chat Widget",
  isActive: true,
  ai: {
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "",
    businessContext: "",
    restrictToBusinessTopics: true,
  },
  contextSources: [],
  branding: {
    logo: "",
    name: "",
    welcomeText: "Hi there 👋",
    responseTimeText: "We typically reply in a few minutes",
  },
  style: {
    primaryColor: "#059669",
    secondaryColor: "#047857",
    position: "right",
    backgroundColor: "#ffffff",
    fontColor: "#333333",
    fontFamily: "Geist Sans",
  },
  behavior: {
    isOpenByDefault: false,
    popupMessage: "👋 Can I help you with something?",
    autoOpenDelay: 5,
    animation: "fade",
    soundEnabled: true,
    showInitialMessage: true,
    initialMessage: "Hello! How can I help you today?",
  },
  faq: [],
};
