export type WatchlistEntityType = "PRODUCT" | "DEAL" | "FOREX" | "CIVIC";

export type WatchlistCondition = 
  | "PRICE_DROP" 
  | "IN_STOCK" 
  | "RATE_ABOVE" 
  | "RATE_BELOW" 
  | "NEW_VERIFIED_DEAL";

export interface WatchlistAlert {
  id: string;
  userId: string;
  entityType: WatchlistEntityType;
  entityId: string;
  condition: WatchlistCondition;
  channel: "EMAIL" | "BROWSER" | "WHATSAPP";
  targetValue?: string; // e.g. "135.50" or "2500"
  currentValue?: string;
  label: string;
  enabled: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface WatchlistTriggerResult {
  alertId: string;
  triggered: boolean;
  reason: string;
  currentValue: string;
}
