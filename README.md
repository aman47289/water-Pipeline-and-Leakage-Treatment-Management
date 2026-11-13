# Water Pipeline and Leakage Management

A dashboard-driven web app for monitoring a water pipeline network, ranking leaks by urgency and planning repair-crew routes. Built as a Data Structures and Algorithms-II project (B.Tech CSE-F, CCSE0301) aligned with SDG 13: Climate Action.

## Features

- **Dashboard:** summary cards, animated pipeline network map, network health gauge, weekly leak chart and repair queue.
- **Pipes:** search, filter, add, deactivate and reactivate pipe records.
- **Leak reports:** report a leak with validation, then move it from open to in progress to resolved.
- **Repair queue:** open leaks ranked by priority score, with a crew route drawn on the map.
- **Settings:** editable priority-score weights and a light/dark theme choice.

## Data structures and algorithms

| Concept | Where it is used |
| --- | --- |
| Graph (edge list / adjacency) | Junctions are vertices and pipes are weighted edges (km) |
| Binary heap (priority queue) | Orders open leaks by priority score (max-heap) |
| Dijkstra's algorithm | Shortest crew route from the depot to a leak (min-heap) |

Priority score = severity weight × severity + area weight × affected area + waiting bonus (defaults 5, 2, and 1 point per 4 hours up to 10).

## Project structure

```
index.html      page markup
css/style.css   styles, light and dark themes, animations
js/app.js       data, heap, Dijkstra, views and forms
```

## Run it

No build step or install is needed. Open `index.html` in a browser.

To publish it, go to the repository **Settings > Pages**, choose the main branch and the root folder, and save.

## Notes

- All data is sample data held in memory, so changes reset when the page is reloaded.
- The Space Grotesk font loads from Google Fonts, so an internet connection is needed for the exact look. A system font is used offline.
- A backend (for example Node.js + Express with PostgreSQL) is the next step if records need to persist.
