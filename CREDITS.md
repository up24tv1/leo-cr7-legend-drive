# LEO CR7: Legend Drive — Credits & Licences

Original game: the characters (Leo "CR7" is a fictional young champion, not any real athlete), the car names and the liveries. It isn't affiliated with any car maker or athlete.

| Asset | Source | Author | Licence |
|---|---|---|---|
| Car & traffic models (race, race-future, sedan-sports, hatchback-sports, sedan, taxi, van, suv, truck, delivery), colormap | Car Kit 3.1, https://kenney.nl/assets/car-kit | Kenney | CC0 1.0 |
| HDRI: The Sky is On Fire (Sunset Highway) | https://polyhaven.com/a/the_sky_is_on_fire | Greg Zaal | CC0 |
| HDRI: Shanghai Bund (Miami Neon Streets) | https://polyhaven.com/a/shanghai_bund | Greg Zaal | CC0 |
| HDRI: Kloofendal 48d Partly Cloudy Pure Sky (Mountain Road) | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky | Greg Zaal | CC0 |
| HDRI: Qwantani Pure Sky (Coastal Circuit) | https://polyhaven.com/a/qwantani_puresky | Greg Zaal | CC0 |
| HDRI: Studio Small 09 (Garage) | https://polyhaven.com/a/studio_small_09 | Sergej Majboroda | CC0 |
| PBR textures: Asphalt 02, Aerial Grass Rock, Rock Face | https://polyhaven.com/textures | Poly Haven | CC0 |
| Engine: three.js r160 (GLTFLoader, RGBELoader, EffectComposer/UnrealBloomPass/OutputPass, DecalGeometry, BufferGeometryUtils) | https://threejs.org | three.js authors | MIT |
| meshoptimizer decoder | https://github.com/zeux/meshoptimizer | Arseny Kapoulkine | MIT |
| Title key art, Leo portrait (crop), Sunset & Miami track cards, app icon base | AI-generated with Z-Image Turbo (HF Space mcp-tools/Z-Image-Turbo) for this project; icon "7" added in code | — | Generated for this project |
| Mountain & Coastal track cards | In-game renders | — | Original |
| Audio | Synthesized at runtime with Web Audio | — | Original |

The three.js `ferrari.glb` sample was considered but NOT used. Its Sketchfab source page is disabled, so the CC-BY licence can't be verified, and it reproduces a real Ferrari 458 design.


## v3 additions
### Player cars (Objaverse 1.0 / Sketchfab, CC BY 4.0: https://creativecommons.org/licenses/by/4.0/). All were recoloured, simplified and compressed.
- Aurum 7: "Fictional supercar - V12 Goblin" by **ollitei**, https://sketchfab.com/3d-models/0a20e49ad5774d778567cb5c3f345786
- Falx V12: "70s italian concept car" by **DanielZhabotinsky**, https://sketchfab.com/3d-models/669ba2899b9c4c09a495620a78ef852c
- Rossa Veloce: "Coupeox futuristic vehicle" by **koleos3d**, https://sketchfab.com/3d-models/f4eeef5af2804647b933207303461e84
- Kreis GT-R: "Car Concept", Khronos glTF Sample Assets (CC BY 4.0)
- Zenith Hyper: "hypercar Agunta" by **George.Schelfaut**, https://sketchfab.com/3d-models/df4fec2a00c247eb9b3bd31b81f575d0
### Traffic (Objaverse / Sketchfab, CC BY 4.0)
- "British compact car - Low poly model" by DanielZhabotinsky (f1e9c43c61bb492a9b15d84f9a16c0f7)
- "Generic 90s light pickup - Low poly model" by DanielZhabotinsky (6c48c94be8974dc7a5932f697c0ba68f)
- "Low Poly City Sedan Stylized" by Bandit.545 (e9a7036924974ff9ac9701ffd0102589)
- "American sedan (lowpoly)" by knorke (1e3aa238b3e341989ff89a2c3c569ce0)
- "SUV" by ABBAS14 (b8ea5f41413f4c9baba3cbd38bfbc899)
(Each URL is https://sketchfab.com/3d-models/<id>)
### Leo podium figure
Original concept image made with Z-Image Turbo (HF Space), converted to 3D with **Tencent Hunyuan3D-2** (HF Space). Subject to the Tencent Hunyuan 3D Community License; that licence does not cover the EU, UK or South Korea. Vertex colours were projected from the concept image. Leo is an original character.
### Audio
- Music: "Afro House Is A Vibe" by **Play House**, Free Music Archive, CC0 1.0 (https://freemusicarchive.org/music/play-house/single/afro-house-is-a-vibe/)
- Engine (high): "Car Engine Loop 96kHz, 4s" by **qubodup**, OpenGameArt, CC BY 3.0 (https://opengameart.org/content/car-engine-loop-96khz-4s)
- Engine (low): "racing car engine sound loops" by **domasx2**, OpenGameArt, CC0 (https://opengameart.org/content/racing-car-engine-sound-loops)
### Tech
three.js SMAAPass / ShaderPass (MIT), glTF-Transform (MIT), meshoptimizer (MIT). Terrain is procedural (own code).
### Removed in v3
Kenney Car Kit models are no longer used (the Kenney colormap is still loaded by the legacy loader path; CC0).

## v3.1 art refresh
- Title key art (landscape + iPhone portrait crop) and Leo portrait: Z-Image Turbo (Tongyi-MAI, Apache-2.0) via Hugging Face Space; portrait upscaled with Real-ESRGAN (BSD-3). Leo is an original character; a small generic emblem on the AI car was blurred.
- Track cards (Sunset Highway, Miami Neon Streets, Mountain Road, Coastal Circuit): Pollinations.ai (FLUX.1-schnell, Apache-2.0); the Pollinations watermark strip was cropped off.
- App icon: drawn procedurally in Python/PIL (carbon-fibre weave + gold 7).
