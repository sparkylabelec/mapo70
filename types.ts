
export interface Scorer {
  name: string;
  goals: number;
}

export interface Assistant {
  name: string;
  assists: number;
}

export interface MatchResult {
  id?: string;
  opponent: string;
  ourScore: number;
  opponentScore: number;
  stadium: string;
  date: string;
  scorers: Scorer[];
  assists?: Assistant[];
  playerCount?: number;
  imageUrls?: string[];
  createdAt: number;
}

export type ViewType = 'home' | 'list' | 'input' | 'login' | 'report' | 'scorer_stats' | 'ai_input';
