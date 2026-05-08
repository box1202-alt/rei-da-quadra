
export interface PlayerPair {
  id: string;
  player1: string;
  player2: string;
  consecutiveWins: number;
  joinedAt?: any;
}

export interface CourtConfig {
  id?: string;
  name: string;
  modality: string;
  activeLeft?: PlayerPair | null;
  activeRight?: PlayerPair | null;
  createdAt?: any;
}
