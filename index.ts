import { Type } from "@sinclair/typebox";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// Skill template - embedded so it works without network access
const SKILL_TEMPLATE = `# NutriChat Nutrition Tracking Workflows

> Customize this file for your personal nutrition tracking workflows.
> This file will NOT be overwritten by plugin updates.

## Quick Reference

### Available Tools

| Tool | Description |
|------|-------------|
| \`nutrichat_get_profile\` | Get user profile, settings, goals, and meal statistics |
| \`nutrichat_list_meals\` | List meals with filters (date, type, category, favorites) |
| \`nutrichat_get_meal\` | Get detailed meal info including component breakdown |
| \`nutrichat_daily_summary\` | Daily nutrition totals, goals, and meal breakdown |
| \`nutrichat_monthly_summary\` | Monthly aggregates, consistency score, weekly trends |
| \`nutrichat_patterns\` | AI-powered eating pattern analysis and insights |

### Meal Types
- \`FOOD\` - Regular meals
- \`SNACK\` - Snacks
- \`DRINK\` - Beverages

### Meal Categories
- \`BREAKFAST\`
- \`BRUNCH\`
- \`LUNCH\`
- \`DINNER\`
- \`SNACK\`

## Common Workflows

### Morning Check-In
1. Get yesterday's summary: \`nutrichat_daily_summary\` with yesterday's date
2. Check if calorie goal was met
3. Review what was eaten

### Weekly Review
1. Get 7-day summary: \`nutrichat_daily_summary\` with \`days: 7\`
2. Check patterns: \`nutrichat_patterns\` with \`period: "7d"\`
3. Review consistency and streaks

### Monthly Progress Report
1. Get monthly summary: \`nutrichat_monthly_summary\` with current month
2. Compare with previous month if needed
3. Review consistency score and weekly breakdown

### Find Favorite Meals
1. List favorites: \`nutrichat_list_meals\` with \`isFavorite: true\`
2. Get details of specific meal: \`nutrichat_get_meal\`

### "On This Day" - What did I eat last year?
1. Query meals from exactly one year ago:
   \`nutrichat_list_meals\` with \`startDate\` and \`endDate\` set to same date one year prior
2. Compare with today's meals

### Calorie Tracking Charts (Last 14 Days)
1. Get daily breakdown: \`nutrichat_daily_summary\` with \`days: 14\`
2. Use the \`dailyBreakdown\` array for visualization data

### Yearly Evolution (12-Month Trend)
1. Get 12-month data: \`nutrichat_monthly_summary\` with \`months: 12\`
2. Review \`monthlyBreakdown\` for macro trends across months

### Streak Tracking
1. Check patterns: \`nutrichat_patterns\` with desired period
2. Look at \`consistency.streakCurrent\` and \`consistency.streakLongest\`

### Habit Analysis
1. Get patterns: \`nutrichat_patterns\` with \`period: "30d"\`
2. Review:
   - \`mealTiming\` for average meal times
   - \`lateNightEating\` for late-night habits
   - \`weekdayPatterns\` for day-by-day averages
   - \`favorites.topMeals\` for most frequent meals

### Check Macro Balance
1. Get patterns: \`nutrichat_patterns\`
2. Review \`nutrition.macroBalance\` for protein/carbs/fat percentages
3. Compare against goals (typical targets: 25-30% protein, 45-55% carbs, 20-30% fat)

## Date Formats

- Single date: \`YYYY-MM-DD\` (e.g., "2024-01-15")
- Month: \`YYYY-MM\` (e.g., "2024-01")
- Period: \`Nd\` where N is days (e.g., "7d", "14d", "30d")

## Tips

- Use \`limit\` parameter when listing meals to control response size
- Use \`offset\` for pagination through large meal lists
- Confirmed meals (\`isConfirmed: true\`) have been verified by the user
- The \`components\` array in meal details shows individual food items with their macros
- \`confidence\` scores in components indicate AI estimation certainty (0-1)
`;

/**
 * Sets up the skill template file
 * - Creates skill if it doesn't exist
 * - If skill exists, saves new template as .latest for comparison
 */
function setupSkillTemplate(): void {
  const skillDir = join(homedir(), ".clawdbot", "skills", "nutrichat");
  const skillFile = join(skillDir, "SKILL.md");
  const latestFile = join(skillDir, "SKILL.md.latest");

  try {
    mkdirSync(skillDir, { recursive: true });

    if (!existsSync(skillFile)) {
      writeFileSync(skillFile, SKILL_TEMPLATE);
      console.log(`[nutrichat] Created skill template: ${skillFile}`);
      console.log("[nutrichat] Customize this file with your personal workflows.");
    } else {
      const existing = readFileSync(skillFile, "utf-8");
      if (existing !== SKILL_TEMPLATE) {
        writeFileSync(latestFile, SKILL_TEMPLATE);
        console.log(`[nutrichat] Skill file exists: ${skillFile} (not modified)`);
        console.log(`[nutrichat] New template available: ${latestFile}`);
        console.log("[nutrichat] Compare with: diff ~/.clawdbot/skills/nutrichat/SKILL.md{,.latest}");
      }
    }
  } catch (err) {
    console.warn("[nutrichat] Could not set up skill template:", err);
  }
}

type NutriChatConfig = {
  apiKey?: string;
  userId?: string;
};

type ClawdbotPluginApi = {
  pluginConfig: unknown;
  registerTool: (tool: {
    name: string;
    description: string;
    parameters: unknown;
    execute: (id: string, params: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>;
  }) => void;
};

type ClawdbotPluginDefinition = {
  id: string;
  name: string;
  description: string;
  version: string;
  configSchema: {
    parse: (v: unknown) => unknown;
    uiHints: Record<string, { label: string; sensitive?: boolean; placeholder?: string; help?: string }>;
  };
  register: (api: ClawdbotPluginApi) => void;
};

const BASE_URL = "https://api.nutri.chat";

const plugin: ClawdbotPluginDefinition = {
  id: "nutrichat",
  name: "NutriChat",
  description: "Track nutrition, log meals, analyze eating patterns with NutriChat",
  version: "1.0.0",

  configSchema: {
    parse: (v) => v as NutriChatConfig,
    uiHints: {
      apiKey: {
        label: "API Key",
        sensitive: true,
        help: "Your NutriChat API key (from account settings or API access section)",
      },
      userId: {
        label: "User ID",
        placeholder: "65d852ac01134c2e33028757",
        help: "Your NutriChat user ID (found in your profile URL: my.nutri.chat/users/{userId})",
      },
    },
  },

  register(api) {
    setupSkillTemplate();

    const cfg = api.pluginConfig as NutriChatConfig;

    if (!cfg.apiKey || !cfg.userId) {
      console.warn("[nutrichat] Plugin not configured. Add to ~/.clawdbot/config.json:");
      console.warn(`  {
    "plugins": {
      "entries": {
        "nutrichat": {
          "enabled": true,
          "config": {
            "apiKey": "your-nutrichat-api-key",
            "userId": "your-nutrichat-user-id"
          }
        }
      }
    }
  }`);
      return;
    }

    const userId = cfg.userId;

    async function nutrichatRequest(endpoint: string, options?: RequestInit) {
      const url = `${BASE_URL}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${cfg.apiKey}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        const errorMsg = data.message || data.error || `HTTP ${res.status}`;
        throw new Error(`NutriChat API error: ${errorMsg}`);
      }

      return data;
    }

    // ============ USER PROFILE ============

    api.registerTool({
      name: "nutrichat_get_profile",
      description: "Get user profile including settings (timezone, calorie goals, demographics), meal statistics (total meals, last 30 days, daily average), and last meal logged",
      parameters: Type.Object({}),
      async execute() {
        const data = await nutrichatRequest(`/api/v1/users/${userId}/profile`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });

    // ============ MEALS ============

    api.registerTool({
      name: "nutrichat_list_meals",
      description: "List meals with optional filters. Returns meal name, type, calories, macros, and metadata. Use for browsing meal history, finding favorites, or filtering by date/type.",
      parameters: Type.Object({
        startDate: Type.Optional(Type.String({ description: "Filter from date (YYYY-MM-DD)" })),
        endDate: Type.Optional(Type.String({ description: "Filter to date (YYYY-MM-DD)" })),
        mealType: Type.Optional(Type.String({ description: "Filter by type: FOOD, SNACK, DRINK" })),
        mealCategory: Type.Optional(Type.String({ description: "Filter by category: BREAKFAST, BRUNCH, LUNCH, DINNER, SNACK" })),
        isConfirmed: Type.Optional(Type.Boolean({ description: "Filter by confirmation status" })),
        isFavorite: Type.Optional(Type.Boolean({ description: "Filter favorites only" })),
        limit: Type.Optional(Type.Number({ description: "Results per page (1-100, default 50)" })),
        offset: Type.Optional(Type.Number({ description: "Pagination offset (default 0)" })),
        sortBy: Type.Optional(Type.String({ description: "Sort field (default: createdAt)" })),
        sortOrder: Type.Optional(Type.String({ description: "Sort order: asc, desc (default: desc)" })),
      }),
      async execute(_id, params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) query.set(key, String(value));
        }
        const queryStr = query.toString();
        const endpoint = `/api/v1/users/${userId}/meals${queryStr ? `?${queryStr}` : ""}`;
        const data = await nutrichatRequest(endpoint);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });

    api.registerTool({
      name: "nutrichat_get_meal",
      description: "Get detailed information about a specific meal including component breakdown (individual food items with weights, macros, AI confidence scores), photo URL, and timestamps",
      parameters: Type.Object({
        mealId: Type.String({ description: "The meal ID to retrieve" }),
      }),
      async execute(_id, params) {
        const { mealId } = params as { mealId: string };
        const data = await nutrichatRequest(`/api/v1/meals/${mealId}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });

    // ============ DAILY SUMMARY ============

    api.registerTool({
      name: "nutrichat_daily_summary",
      description: "Get daily nutrition summary with totals (calories, protein, carbs, fat), goal progress, and meal breakdown. Supports single day, last N days (max 30), or date range. Multi-day queries include daily averages and goal analysis.",
      parameters: Type.Object({
        date: Type.Optional(Type.String({ description: "Specific date (YYYY-MM-DD) for single-day summary" })),
        days: Type.Optional(Type.Number({ description: "Last N days (1-30) for multi-day summary" })),
        startDate: Type.Optional(Type.String({ description: "Range start date (YYYY-MM-DD)" })),
        endDate: Type.Optional(Type.String({ description: "Range end date (YYYY-MM-DD)" })),
      }),
      async execute(_id, params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) query.set(key, String(value));
        }
        const queryStr = query.toString();
        const endpoint = `/api/v1/users/${userId}/summary/daily${queryStr ? `?${queryStr}` : ""}`;
        const data = await nutrichatRequest(endpoint);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });

    // ============ MONTHLY SUMMARY ============

    api.registerTool({
      name: "nutrichat_monthly_summary",
      description: "Get monthly nutrition summary with totals, daily averages, consistency score, weekly breakdown, and meal distribution. Supports single month, last N months (max 12), or month range.",
      parameters: Type.Object({
        month: Type.Optional(Type.String({ description: "Specific month (YYYY-MM) for single-month summary" })),
        months: Type.Optional(Type.Number({ description: "Last N months (1-12) for multi-month summary" })),
        startMonth: Type.Optional(Type.String({ description: "Range start month (YYYY-MM)" })),
        endMonth: Type.Optional(Type.String({ description: "Range end month (YYYY-MM)" })),
      }),
      async execute(_id, params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) query.set(key, String(value));
        }
        const queryStr = query.toString();
        const endpoint = `/api/v1/users/${userId}/summary/monthly${queryStr ? `?${queryStr}` : ""}`;
        const data = await nutrichatRequest(endpoint);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });

    // ============ PATTERNS ANALYSIS ============

    api.registerTool({
      name: "nutrichat_patterns",
      description: "Get AI-powered nutritional insights and behavioral patterns including: meal timing averages, late-night eating metrics, logging consistency and streaks, calorie variance, macro percentages, favorite meals/ingredients, and weekday patterns with per-day averages.",
      parameters: Type.Object({
        period: Type.Optional(Type.String({ description: "Analysis timeframe, e.g., '7d', '14d', '30d' (default: 30d)" })),
      }),
      async execute(_id, params) {
        const { period } = params as { period?: string };
        const query = period ? `?period=${period}` : "";
        const data = await nutrichatRequest(`/api/v1/users/${userId}/patterns${query}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    });
  },
};

export default plugin;
