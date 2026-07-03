# CourtMotion Step-by-Step Website

This package contains a complete multi-page demo website for a tennis AI performance analysis workflow.

## Pages

1. `index.html` — Profile setup: age, gender, playing hand, and playing style.
2. `player-style.html` — Player model selection: ATP/WTA top-10 style cards.
3. `devices.html` — Device status page: camera and smart-watch on/off toggles.
4. `report.html` — Final tennis performance analysis report.

## Assets included

- Local player character images for male/female and right/left hand.
- Local cropped headshot images for the Step 2 selected-player preview.
- Local SVG icons.
- Local CSS and JavaScript.
- Reference images from the original design.

## How to run

Open `index.html` in a browser and proceed through the four steps.

The player thumbnails are requested from Wikipedia when the site is online. When offline, the cards automatically show initials as a fallback.

## Notes

- The camera and smart-watch connections are simulated with on/off toggles for the website demo.
- The final report can be saved as a PDF using the `Download Report` button, which opens the browser print/save dialog.

## Latest fixes

- Step 2 uses cropped headshot previews instead of foot/body crops.
- The report page uses a cleaner grid layout so the analysis boxes and bottom summary cards stay aligned.
## Update v6
- Step 2 player cards now show only the square headshot and one name block at the bottom.
- Removed the duplicate middle name area caused by the offline fallback layer showing under loaded photos.
- Reduced the player card height for a cleaner selection page.
