import * as cheerio from "cheerio";

const STEAM_CHARTS_URL = "https://steamcharts.com/app/";

interface SteamCharts {
  oneHourAgo: number;
  twentyFourHourPeak: number;
  allTimePeak: number;
  chartData: ChartData[];
}

interface ChartData {
  month: string;
  avgPlayers: number;
  gain: number;
  gainPercent: string;
  peakPlayers: number;
}

export const getSteamChartsForId = async (
  gameId: string
): Promise<SteamCharts> => {
  const response = await fetch(STEAM_CHARTS_URL + gameId);
  const data = await response.text();
  const [oneHourAgo, twentyFourHourPeak, allTimePeak] = extractRecentData(data);
  const chartData = extractChartData(data);
  return {
    oneHourAgo,
    twentyFourHourPeak,
    allTimePeak,
    chartData,
  };
};

const extractRecentData = (html: string): [number, number, number] => {
  const $ = cheerio.load(html);
  const numberElements = $(".app-stat .num");
  const extractedNumbers: number[] = [];
  numberElements.each((_, element) => {
    const textValue = $(element).text();
    const numericValue = parseInt(textValue.replace(/,/g, ""), 10);
    if (!isNaN(numericValue)) {
      extractedNumbers.push(numericValue);
    }
  });
  return [extractedNumbers[0], extractedNumbers[1], extractedNumbers[2]];
};

const extractChartData = (html: string): ChartData[] => {
  const $ = cheerio.load(html);
  const data: ChartData[] = [];

  $("table.common-table tbody tr").each((index, element) => {
    const row = $(element);
    const cells = row.find("td");

    if (cells.length === 5) {
      const monthText = $(cells.get(0)).text().trim();
      const avgPlayersText = $(cells.get(1)).text().trim();
      const gainText = $(cells.get(2)).text().trim();
      const gainPercentText = $(cells.get(3)).text().trim();
      const peakPlayersText = $(cells.get(4)).text().trim();

      const chartEntry: ChartData = {
        month: monthText,
        avgPlayers: parseFloat(avgPlayersText),
        gain: parseFloat(gainText),
        gainPercent: gainPercentText,
        peakPlayers: parseInt(peakPlayersText, 10),
      };
      data.push(chartEntry);
    }
  });

  return data;
};
