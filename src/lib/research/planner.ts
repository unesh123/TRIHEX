import { ResearchPlan, ResearchTopicCategory } from "./types";

export function buildResearchPlan(query: string): ResearchPlan {
  const q = query.toLowerCase();

  const isEconomy = /remittance|reserve|reserves|inflation|cpi|interest rate|policy rate|trade deficit|balance of payment|budget|economy|economic/.test(q);
  const isForex = !isEconomy && /forex|dollar|usd|npr|exchange rate|rupee|currency|spread|nrb rate/.test(q);
  const isSeismic = /earthquake|quake|seismic|tremor|richter|jajarkot|bajhang|usgs|magnitude/.test(q);
  const isDatasets = /census|population|hydro|hydropower|hospital|health|tourism|administrative|boundaries|dataset|records/.test(q);

  let category: ResearchTopicCategory = "GENERAL";
  if (isEconomy) category = "ECONOMY";
  else if (isForex) category = "FOREX";
  else if (isSeismic) category = "SEISMOLOGY";
  else if (isDatasets) category = "CIVIC_DATA";
  else if (/ai|software|developer|tech|cloud|api/.test(q)) category = "TECHNOLOGY";

  // Generate targeted keywords for search if needed
  const words = q.split(/\s+/).filter((w) => w.length > 3 && !/what|when|where|which|about|nepal|report/.test(w));
  const searchKeywords = words.slice(0, 5);

  return {
    query,
    detectedCategory: category,
    requiresStructuredForex: isForex || isEconomy,
    requiresStructuredSeismic: isSeismic,
    requiresStructuredEconomy: isEconomy || isForex,
    requiresStructuredDatasets: isDatasets || isEconomy,
    searchKeywords,
  };
}
