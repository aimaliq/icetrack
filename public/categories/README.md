# Category images

Generated from `public/Images/*.png` — the originals are kept there as the
source of truth. To regenerate after replacing one:

```js
// npm install --no-save sharp, then run with node
const sharp = require("sharp");
await sharp("public/Images/jet.png")
  .trim()                                    // crop the empty margin
  .resize({ width: 640, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 90, effort: 6 })
  .toFile("public/categories/jet.webp");
```

`trim()` and `alphaQuality` matter: these are cut-outs with real transparency,
which is what lets them sit on both the light and dark theme without a visible
box. The originals total ~15 MB (house.png alone was 10.5 MB); these are ~200 KB
combined.
