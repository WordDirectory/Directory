# WordDirectory Extension

Words explained simply, because fuck complex definitions.

## What it does

Type "[word] definition" in any search engine (Google, Bing, DuckDuckGo, Yahoo) and we'll take you straight to a definition that actually makes sense.

## Install

1. Clone this repo
2. Run `npm install`
3. Run `npm run build`
4. Go to `chrome://extensions`
5. Enable Developer mode
6. Click "Load unpacked" and select the `dist` folder

## Updating the extension

1. Make the changes you need
2. Run `npm run build`
3. Install the extension locally
4. Test everything works
5. Make a `.zip` file containing:
   - `icons/`
   - `dist/`
   - `manifest.json`
6. Commit your changes
7. Push them to GitHub
8. Go to [Developer Dashboard - Chrome](https://chrome.google.com/u/3/webstore/devconsole/69bbd504-9f67-4ea0-80b6-b195bfaea834/nmbecimflkmecigpnnflifohoghhgdah/edit/package)
9. Update the package and submit review

That's it