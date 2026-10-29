import { post } from "./client";

// Connected: POST /recommendations
// Backend: RecommendationService.get_recommendations()
export function getRecommendations(disease) {
  return post("/recommendations", { disease });
}
