# Lalish — الوادي المقدّس

A self-contained, interactive Three.js interpretation of the Yazidi Lalish holy valley. Arabic interface, night mode on first load, warm temple lighting, daylight, a 60-second cinematic tour, orbit/zoom controls, five optional Arabic markers, an information dialog, and GLB export.

## Open immediately

Open **index.html** in a modern browser with WebGL 2 enabled. The included `scene.bundle.js`, font, and styles are local; there are no runtime CDN calls and no backend. Keep the files and `assets/` folder together. The same ready-to-run files are in `out/` after building.

## Source structure

```text
index.html                 Arabic page, controls, accessible dialog
styles.css                 Responsive RTL interface and local font
scene.js                   Commented Three.js source and interactions
scene.bundle.js            Ready-to-run, bundled browser script
favicon.svg                Site icon
assets/                    Local fonts and license notices (ready copy)
public/assets/             Asset source used by the build
scripts/build.mjs          Bundles JavaScript and assembles static output
vite.static.config.js      Optional local development server
package.json               Development commands
package-lock.json          Locked dependency versions
out/                       Complete static website after npm run build
.openai/hosting.json        Private Sites publishing configuration
```

## Edit and rebuild

Node.js 22.13 or later is required only for development:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal. Changes to `scene.js` rebuild the bundle; refresh the page to recreate the scene. To produce the standalone files:

```sh
npm run build
```

Upload the contents of `out/` to any static web host. No server functions, database, authentication service, or environment variables are needed to run the application.

## Controls

- Drag or swipe: orbit the temple. Wheel or pinch: zoom.
- Arabic day/night buttons smoothly change the illumination.
- The automatic tour ends after 60 seconds. Dragging, resetting, or zooming stops it.
- Enable labels, then select a marker to move to a detailed camera view.
- Focus the scene with Tab; arrow keys rotate, `+` / `-` zoom, and `R` resets.
- The information dialog supports Escape and keyboard focus trapping.
- In **معلومات**, choose **تنزيل المجسّم GLB** to export the temple and courtyard. The GLB contains standard geometry, PBR materials, and embedded procedural textures. The valley, sky shader, HTML labels, lamps' light effects, and postprocessing remain part of the browser presentation.

## Architecture and performance

The model is an artistic interpretation, not a measured reconstruction. Major volumes use low stone buildings, raised drums, vertically fluted conical spires, stone portals, a courtyard, terraces, steps and wooded slopes. No invented ritual activity is depicted.

Stone maps are generated on local canvases. Static geometry is merged by material; trees and rocks are instanced. Shadows use one directional light, and warm illumination uses a small set of unshadowed lights. Desktop rendering adds restrained bloom. Smaller or low-core devices use a lower pixel ratio and omit bloom, while slow rendering triggers a further resolution reduction. Rendering pauses while the tab is hidden. WebGL failures display an Arabic recovery message.

The interface respects reduced-motion preferences for view transitions. The explicitly started tour still moves the camera and can be stopped at any time.

## References and licenses

- [UNESCO: Lalish Temple, Iraq's Tentative List submission](https://whc.unesco.org/en/tentativelists/6467/)
- [French Ministry of Culture: Yazidi heritage in Iraq](https://archeologie.culture.gouv.fr/proche-orient/en/yazidi-heritage-iraq)
- [Mesopotamia Heritage: Lalish spiritual centre and Sheikh Adi mausoleum](https://www.mesopotamiaheritage.org/en/monuments/le-centre-spirituel-yezidi-de-lalesh-et-le-mausolee-de-cheikh-adi/)
- [Three.js documentation](https://threejs.org/docs/) — MIT license included under `assets/`.
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — SIL Open Font License included beside the self-hosted Arabic font.

The source and standalone bundle are both supplied. The original Sites scaffold's installed development dependencies are retained in the lockfile; they are not included in the browser output.
