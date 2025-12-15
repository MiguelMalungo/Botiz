import { WidgetConfig, defaultWidgetConfig } from "@/types/widget";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "chatwoot_widgets";

export function getWidgets(): WidgetConfig[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getWidget(id: string): WidgetConfig | null {
  const widgets = getWidgets();
  return widgets.find((w) => w.id === id) || null;
}

export function createWidget(
  config: Partial<Omit<WidgetConfig, "id" | "createdAt" | "updatedAt">> = {}
): WidgetConfig {
  const now = new Date().toISOString();
  const newWidget: WidgetConfig = {
    ...defaultWidgetConfig,
    ...config,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const widgets = getWidgets();
  widgets.push(newWidget);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));

  return newWidget;
}

export function updateWidget(
  id: string,
  updates: Partial<Omit<WidgetConfig, "id" | "createdAt">>
): WidgetConfig | null {
  const widgets = getWidgets();
  const index = widgets.findIndex((w) => w.id === id);

  if (index === -1) return null;

  widgets[index] = {
    ...widgets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  return widgets[index];
}

export function deleteWidget(id: string): boolean {
  const widgets = getWidgets();
  const filtered = widgets.filter((w) => w.id !== id);

  if (filtered.length === widgets.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function duplicateWidget(id: string): WidgetConfig | null {
  const widget = getWidget(id);
  if (!widget) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...config } = widget;
  return createWidget({
    ...config,
    name: `${widget.name} (Copy)`,
  });
}
