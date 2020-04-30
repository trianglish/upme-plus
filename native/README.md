## GramUp Native build

We use basic Electron template. Refer to ]ELECTRON-README.md] for setup guide.

## Build

```bash

```

## Run

```bash
npm install
npm run start
```

It depends on `GramUp` repo, so make sure you have configured and built extension.
```
npm i
npm run build # or dev
```

**Note**: You have to disable `src/background/services/insecure_headers.js` in `GramUp`, because Electron configures headers himself.
