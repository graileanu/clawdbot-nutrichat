# clawdbot-nutrichat

Private NutriChat integration plugin for [Clawdbot](https://clawd.bot).

This plugin allows Clawdbot to interact with your NutriChat food and nutrition tracking system - query meals, analyze nutrition data, track macros, review eating patterns, and monitor progress toward dietary goals through natural language commands.

**Private plugin** - Not intended for public distribution.

## Features

- **Meal History**: Browse, filter, and search logged meals
- **Nutrition Tracking**: Query daily/monthly totals for calories, protein, carbs, fat
- **Goal Progress**: Track calorie goals and remaining allowance
- **Pattern Analysis**: AI-powered insights into eating habits and consistency
- **Favorites**: Find and review favorite meals
- **Streak Tracking**: Monitor logging consistency and streaks

## Installation

Since this is a private plugin, install via symlink:

```bash
# Symlink for development/use
ln -s ~/Projects/clawdbot/clawdbot-nutrichat ~/.clawdbot/extensions/nutrichat
```

## Configuration

Add to your `~/.clawdbot/config.json`:

```json
{
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
}
```

The API base URL (`https://api.nutri.chat`) is hardcoded in the plugin.

### Getting your API Credentials

1. Log in to [NutriChat](https://my.nutri.chat)
2. Navigate to your account settings or API access section
3. Copy your **API Key** and **User ID**
4. Your profile URL format: `https://my.nutri.chat/users/{your-user-id}`

## Available Tools

| Tool | Description |
|------|-------------|
| `nutrichat_get_profile` | Get user profile, settings (timezone, calorie goals, demographics), meal statistics, and last meal logged |
| `nutrichat_list_meals` | List meals with filters: date range, meal type (FOOD/SNACK/DRINK), category (BREAKFAST/LUNCH/DINNER/etc), favorites, confirmation status, with pagination |
| `nutrichat_get_meal` | Get detailed meal info including component breakdown (individual foods with weights, macros, AI confidence), photo URL |
| `nutrichat_daily_summary` | Daily nutrition totals (calories, protein, carbs, fat), goal progress, meal breakdown by type/category. Supports single day, last N days (max 30), or date range |
| `nutrichat_monthly_summary` | Monthly aggregates, daily averages, consistency score, weekly breakdown, meal distribution. Supports single month, last N months (max 12), or month range |
| `nutrichat_patterns` | AI-powered eating pattern analysis: meal timing, late-night eating, logging streaks, calorie variance, macro balance, favorite meals, weekday patterns |

## Example Queries

### Check yesterday's nutrition
```
"How did I do on calories yesterday?"
→ Uses nutrichat_daily_summary with yesterday's date
```

### Weekly review
```
"Show me my nutrition for the past week"
→ Uses nutrichat_daily_summary with days: 7
```

### Find patterns
```
"What are my eating patterns this month?"
→ Uses nutrichat_patterns with period: "30d"
```

### Browse favorites
```
"What are my favorite meals?"
→ Uses nutrichat_list_meals with isFavorite: true
```

### Monthly progress
```
"How consistent was I in December?"
→ Uses nutrichat_monthly_summary with month: "2024-12"
```

### Year-over-year comparison
```
"What did I eat on this day last year?"
→ Uses nutrichat_list_meals with startDate/endDate set to one year ago
```

## Custom Skills

For personalized workflows, the plugin automatically creates a skill template at:

```
~/.clawdbot/skills/nutrichat/SKILL.md
```

Customize this file with your own nutrition workflows and preferences.

See [examples/SKILL-TEMPLATE.md](examples/SKILL-TEMPLATE.md) for the default template.

## API Reference

- Base URL: `https://api.nutri.chat`
- Authentication: Bearer token
- Documentation: https://api.nutri.chat/docs

## License

Private - All rights reserved.
