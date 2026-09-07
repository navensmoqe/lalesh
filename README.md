# Lalish — الوادي المقدّس

A self-contained, interactive Three.js interpretation of the Yazidi Lalish holy valley in Northern Iraq. Arabic and English interfaces, night mode on first load, warm temple lighting, daylight, a continuously looping cinematic tour, orbit/zoom controls, five optional bilingual markers, an information dialog, and GLB export. Arabic is the default. Use the language button in the header to switch to English or back to العربية; the choice is remembered on this device when browser storage is available.

## Open immediately

Open **index.html** in a modern browser with WebGL 2 enabled. The included `scene.bundle.js`, font, and styles are local; there are no runtime CDN calls and no backend. Keep the files and `assets/` folder together. The same ready-to-run files are in `out/` after building.

## Source structure

```text
index.html                 Arabic page, controls, accessible dialog
styles.css                 Responsive RTL interface and local font
scene.js                   Commented Three.js source and interactions
i18n.js                    Arabic/English copy and live language switching
night-particles.js         GPU-animated golden embers and glowing fireflies
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
- Day/night buttons smoothly change the illumination.
- The English / العربية button translates the interface, scene markers, information, camera hints, and status messages without resetting the camera, lighting, or active tour. English uses left-to-right layout.
- The automatic tour repeats a seamless 60-second loop indefinitely. Use Stop tour, or take control by dragging, resetting, or zooming, to stop it.
- The crossed-eye button hides all interface text, markers, controls, and decorative overlays, keeping the 3D scene and a small eye button for restoring the interface. Press `H` to toggle or `Escape` to restore. Camera motion, day/night mode, and the previous labels setting are preserved when hiding or restoring the interface.
- Enable labels, then select a marker to move to a detailed camera view.
- Focus the scene with Tab; arrow keys rotate, `+` / `-` zoom, and `R` resets.
- The information dialog supports Escape and keyboard focus trapping.
- In **معلومات**, choose **تنزيل المجسّم GLB** to export the temple and courtyard. The GLB contains standard geometry, PBR materials, and embedded procedural textures. The valley, sky shader, HTML labels, lamps' light effects, and postprocessing remain part of the browser presentation.

## Architecture and performance

The model is an artistic interpretation, not a measured reconstruction. Major volumes use low stone buildings, raised drums, vertically fluted conical spires, stone portals, a courtyard, terraces, steps and wooded slopes. No invented ritual activity is depicted.

Stone maps are generated on local canvases. Static geometry is merged by material; trees and rocks are instanced. Shadows use one directional light, and warm illumination uses a small set of unshadowed lights. Desktop rendering adds restrained bloom. Smaller or low-core devices use a lower pixel ratio and omit bloom, while slow rendering triggers a further resolution reduction. Rendering pauses while the tab is hidden. WebGL failures display an Arabic recovery message.

Night mode includes gently rising amber embers and slowly pulsing golden fireflies, scattered near lanterns, through the courtyard, alongside the temple and over the surrounding landscape. Their soft glow fades out in daylight and remains visible with the interface hidden. The entire effect uses one GPU-animated point cloud (320 particles on desktop, 140 on smaller or low-core devices), with no additional textures or lights. Depth testing keeps particles behind solid architecture, and fog softens distant glows. The effect adapts to resolution changes and works with or without bloom.

The interface respects reduced-motion preferences for view transitions; night particles retain a static glow when reduced motion is enabled. The explicitly started tour still moves the camera and can be stopped at any time.

## References and licenses

- [UNESCO: Lalish Temple, Iraq's Tentative List submission](https://whc.unesco.org/en/tentativelists/6467/)
- [French Ministry of Culture: Yazidi heritage in Iraq](https://archeologie.culture.gouv.fr/proche-orient/en/yazidi-heritage-iraq)
- [Mesopotamia Heritage: Lalish spiritual centre and Sheikh Adi mausoleum](https://www.mesopotamiaheritage.org/en/monuments/le-centre-spirituel-yezidi-de-lalesh-et-le-mausolee-de-cheikh-adi/)
- [Three.js documentation](https://threejs.org/docs/) — MIT license included under `assets/`.
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — SIL Open Font License included beside the self-hosted Arabic font.

The source and standalone bundle are both supplied. The original Sites scaffold's installed development dependencies are retained in the lockfile; they are not included in the browser output.
