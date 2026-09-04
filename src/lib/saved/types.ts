export type SavedEntityType = "PRODUCT" | "DEAL" | "PROMPT" | "SKILL";

export interface SavedItemMetadata {
  title: string;
  description?: string;
  url: string;
  badge: string;
  badgeColor?: string;
  priceOrValue?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  entityType: SavedEntityType;
  entityId: string;
  createdAt: string;
  metadata?: SavedItemMetadata;
}
