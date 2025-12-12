export interface FruitConfig {
  kind: string;
  score: number;
  spawnWeight: number;
}

export interface GameConfig {
  gameDurationSeconds: number;
  initialLives: number;
  fruits: FruitConfig[];
  hazardDamage: number;
}

export const DefaultGameConfig: GameConfig = {
  gameDurationSeconds: 60,
  initialLives: 3,
  hazardDamage: 1,
  fruits: [
    { kind: "apple", score: 10, spawnWeight: 1 },
    { kind: "banana", score: 15, spawnWeight: 1 },
    { kind: "orange", score: 20, spawnWeight: 0.7 }
  ]
};
