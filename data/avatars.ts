import type { AgentId } from "./agents";

export interface SuitData {
  palette: Record<string, string>;
  data: string[];
}

export function makeSuit(accent: string, accentDark: string): SuitData {
  return {
    palette: {
      ".": "transparent",
      "k": "#0a0e27",
      "w": "#e6ecf5",
      "W": "#ffffff",
      "S": "#a9b6cc",
      "g": "#0e1430",
      "G": "#5ce5ff",
      "v": "#9af0ff",
      "a": accent,
      "A": accentDark,
      "b": "#3a4870",
      "c": "#5ce5ff",
      "y": "#ffd84d",
    },
    data: [
      "......kkkkkkkk....",
      ".....kWWWWWWWWk...",
      "....kWggggggggWk..",
      "....kWgGGvvgggWk..",
      "...kWggGvvggggWWk.",
      "...kWggggggggggWk.",
      "...kWggggggggggWk.",
      "....kWgggggggWWk..",
      ".....kkWWWWWWkk...",
      "....kwwwwwwwwwwk..",
      "...kwwaaaaaawwwwk.",
      "..kbwaaaaaaaawwwbk",
      "..kbwaakAAkaawwwbk",
      "..kbwwaaAAaawwwwbk",
      "..kbwwwaaaawwwwwbk",
      "..kbwwwwwwwwwwwwbk",
      "..kbwwwwccwwwwwwbk",
      "...kwwwwccwwwwwwk.",
      "....kwwwwwwwwwwk..",
      "....kkwwwwwwwwkk..",
      ".....kkw....wkk...",
      ".....kkk....kkk...",
    ],
  };
}

export const SUIT: Record<AgentId, SuitData> = {
  marky: makeSuit("#ff4ec9", "#8a2877"),
  dali:  makeSuit("#5ce5ff", "#2a86a8"),
  addy:  makeSuit("#ffd84d", "#a08820"),
  penny: makeSuit("#66ff9d", "#2a8a55"),
};
