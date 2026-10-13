# Landing scene assets

- `planet.glb`, `planet-lights.glb`, `planet-clouds.png`: supplied Ascend reference assets, retrieved from `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/`.
- `draco/draco_wasm_wrapper.js`, `draco/draco_decoder.wasm`: unmodified decoder files from the installed `three/examples/jsm/libs/draco/gltf` distribution. Locally hosted so the decorative scene has no runtime CDN dependency.

The application loads this scene only on the public welcome page. The fallback atmosphere remains visible if WebGL or an asset is unavailable. It does not block page content, capture input, or represent live academic data.
