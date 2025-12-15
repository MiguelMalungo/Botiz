import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateEmbedCode(widgetId: string, baseUrl: string): string {
  return `<!-- ChatWoot Widget -->
<script>
  window.ChatWidgetConfig = {
    widgetId: "${widgetId}",
    baseUrl: "${baseUrl}"
  };
</script>
<script src="${baseUrl}/widget/loader.js" async></script>`;
}
