import * as cheerio from "cheerio";

const SEARCH_GAME_URL =
  "https://store.steampowered.com/search/?category1=998&term=";

export const getSteamGameId = async (gameName: string) => {
  const response = await fetch(SEARCH_GAME_URL + gameName);
  const data = await response.text();
  return extractGameIdFromHtml(data);
};

// Only gets the first game ID... No advanced search yet.
const extractGameIdFromHtml = (html: string) => {
  const $ = cheerio.load(html);
  const gameId = $(".search_result_row").attr("data-ds-appid");
  return gameId;
};
