# NutriChat Nutrition Tracking Workflows

> Customize this file for your personal nutrition tracking workflows.
> This file will NOT be overwritten by plugin updates.

## Quick Reference

### Available Tools

| Tool | Description |
|------|-------------|
| `nutrichat_get_profile` | Get user profile, settings, goals, and meal statistics |
| `nutrichat_list_meals` | List meals with filters (date, type, category, favorites) |
| `nutrichat_get_meal` | Get detailed meal info including component breakdown |
| `nutrichat_daily_summary` | Daily nutrition totals, goals, and meal breakdown |
| `nutrichat_monthly_summary` | Monthly aggregates, consistency score, weekly trends |
| `nutrichat_patterns` | AI-powered eating pattern analysis and insights |

### Meal Types
- `FOOD` - Regular meals
- `SNACK` - Snacks
- `DRINK` - Beverages

### Meal Categories
- `BREAKFAST`
- `BRUNCH`
- `LUNCH`
- `DINNER`
- `SNACK`

## Common Workflows

### Morning Check-In
1. Get yesterday's summary: `nutrichat_daily_summary` with yesterday's date
2. Check if calorie goal was met
3. Review what was eaten

### Weekly Review
1. Get 7-day summary: `nutrichat_daily_summary` with `days: 7`
2. Check patterns: `nutrichat_patterns` with `period: "7d"`
3. Review consistency and streaks

### Monthly Progress Report
1. Get monthly summary: `nutrichat_monthly_summary` with current month
2. Compare with previous month if needed
3. Review consistency score and weekly breakdown

### Find Favorite Meals
1. List favorites: `nutrichat_list_meals` with `isFavorite: true`
2. Get details of specific meal: `nutrichat_get_meal`

### "On This Day" - What did I eat last year?
1. Query meals from exactly one year ago:
   `nutrichat_list_meals` with `startDate` and `endDate` set to same date one year prior
2. Compare with today's meals

### Calorie Tracking Charts (Last 14 Days)
1. Get daily breakdown: `nutrichat_daily_summary` with `days: 14`
2. Use the `dailyBreakdown` array for visualization data

### Yearly Evolution (12-Month Trend)
1. Get 12-month data: `nutrichat_monthly_summary` with `months: 12`
2. Review `monthlyBreakdown` for macro trends across months

### Streak Tracking
1. Check patterns: `nutrichat_patterns` with desired period
2. Look at `consistency.streakCurrent` and `consistency.streakLongest`

### Habit Analysis
1. Get patterns: `nutrichat_patterns` with `period: "30d"`
2. Review:
   - `mealTiming` for average meal times
   - `lateNightEating` for late-night habits
   - `weekdayPatterns` for day-by-day averages
   - `favorites.topMeals` for most frequent meals

### Check Macro Balance
1. Get patterns: `nutrichat_patterns`
2. Review `nutrition.macroBalance` for protein/carbs/fat percentages
3. Compare against goals (typical targets: 25-30% protein, 45-55% carbs, 20-30% fat)

## Date Formats

- Single date: `YYYY-MM-DD` (e.g., "2024-01-15")
- Month: `YYYY-MM` (e.g., "2024-01")
- Period: `Nd` where N is days (e.g., "7d", "14d", "30d")

## Tips

- Use `limit` parameter when listing meals to control response size
- Use `offset` for pagination through large meal lists
- Confirmed meals (`isConfirmed: true`) have been verified by the user
- The `components` array in meal details shows individual food items with their macros
- `confidence` scores in components indicate AI estimation certainty (0-1)
