import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getSteamGameId } from "./services/get-steam-game-id.js";
import { getSteamChartsForId } from "./services/get-steam-charts-for-id.js";

const server = new McpServer({
  name: "steam-charts",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get-game-id",
  "Get the game ID of a steam game",
  {
    gameName: z.string().describe("Name of the steam game to search for"),
  },
  async ({ gameName }) => {
    const gameId = await getSteamGameId(gameName);

    if (!gameId) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve game ID",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Game ID for ${gameName}: ${gameId}`,
        },
      ],
    };
  }
);

server.tool(
  "get-steam-charts",
  "Get the Steam charts for a game",
  {
    gameId: z.string().describe("The ID of the steam game to get charts for"),
  },
  async ({ gameId }) => {
    const charts = await getSteamChartsForId(gameId);

    if (!charts) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve charts",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Chart data for ${gameId}: ${JSON.stringify(charts)}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Steam Charts MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
