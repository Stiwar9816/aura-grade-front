import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';

/** Decorative, locally hosted scene. It never owns pointer, wheel or keyboard input. */
export async function createPlanetScene(canvas: HTMLCanvasElement) {
 let renderer: THREE.WebGLRenderer;
 try { renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'}); }
 catch { return null; }
 renderer.setClearColor(0x000000, 0);
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
 camera.position.z = 7;
 const world = new THREE.Group();
 const globe = new THREE.Group();
 globe.rotation.set(.12, 2.07, .37);
 world.add(globe);
 scene.add(world);
 const draco = new DRACOLoader().setDecoderPath('/landing/draco/');
 const loader = new GLTFLoader().setDRACOLoader(draco);
 const textures = new Set<THREE.Texture>();
 const geometries = new Set<THREE.BufferGeometry>();
 const materials = new Set<THREE.Material>();
 const loadedRoots: THREE.Object3D[] = [];
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 let dead = false, paused = false, lost = false, frame = 0, previous = 0, phase = 0, progress = 0;
 let dark = document.documentElement.classList.contains('dark');
 const track = (root: THREE.Object3D) => root.traverse(object => {
  if (!(object instanceof THREE.Mesh)) return;
  geometries.add(object.geometry);
  const values = Array.isArray(object.material) ? object.material : [object.material];
  for (const material of values) {
   materials.add(material);
   for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
  }
 });
 const disposeResources = () => {
  loadedRoots.forEach(track);
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => { value.dispose(); const image = value.source?.data; if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close(); });
 };
 // Preserve partial loads for cleanup if another asset fails.
 try {
  const assets = await Promise.allSettled([
   loader.loadAsync('/landing/planet.glb').then(value => {loadedRoots.push(value.scene); return value;}),
   loader.loadAsync('/landing/planet-lights.glb').then(value => {loadedRoots.push(value.scene); return value;}),
   new THREE.TextureLoader().loadAsync('/landing/planet-clouds.png').then(value => {textures.add(value); return value;}),
  ]);
  const [earthResult, lightsResult, cloudResult] = assets;
  if (earthResult.status !== 'fulfilled' || lightsResult.status !== 'fulfilled' || cloudResult.status !== 'fulfilled') throw new Error('Planet asset unavailable');
  const earth = earthResult.value, lights = lightsResult.value, clouds = cloudResult.value;
  loadedRoots.forEach(track);
  let earthMesh: THREE.Mesh | undefined;
  let nightTexture: THREE.Texture | null = null;
  earth.scene.traverse(object => {if (!earthMesh && object instanceof THREE.Mesh) earthMesh = object;});
  lights.scene.traverse(object => {if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) nightTexture = object.material.map;});
  if (!earthMesh || !nightTexture) throw new Error('Planet texture unavailable');
  const mesh: THREE.Mesh = earthMesh;
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) throw new Error('Planet material unavailable');
  const dayTexture = mesh.material.map;
  mesh.geometry.computeBoundingSphere();
  const radius = mesh.geometry.boundingSphere?.radius || 1;
  mesh.scale.setScalar(1.95 / radius);
  mesh.position.set(0, 0, 0);
  const surface = new THREE.ShaderMaterial({
   uniforms: {day: {value: dayTexture}, night: {value: nightTexture}, tint: {value: new THREE.Color('#8fabe0')}},
   vertexShader: 'varying vec2 vUv; varying vec3 vNormal; void main(){vUv=uv; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader: `varying vec2 vUv; varying vec3 vNormal; uniform sampler2D day; uniform sampler2D night; uniform vec3 tint;
    void main(){ vec3 n=normalize(vNormal); float sun=dot(n,normalize(vec3(-.8,.5,1.)));
     vec3 terrain=texture2D(day,vUv).rgb; vec3 cities=texture2D(night,vUv).rgb;
     float daylight=smoothstep(-.2,.6,sun); vec3 color=terrain*(.07+daylight*.95);
     color+=cities*(1.-daylight)*1.7; float rim=pow(1.-max(n.z,0.),3.);
     color+=tint*rim*.75; gl_FragColor=vec4(color,1.);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`,
  });
  materials.add(surface); mesh.material = surface; globe.add(mesh);
  const sphere = new THREE.SphereGeometry(1.95, 48, 32); geometries.add(sphere);
  const cloudMaterial = new THREE.MeshBasicMaterial({map: clouds, transparent: true, opacity: .16, depthWrite: false, blending: THREE.AdditiveBlending});
  materials.add(cloudMaterial);
  const cloudLayer = new THREE.Mesh(sphere, cloudMaterial); cloudLayer.scale.setScalar(1.013); globe.add(cloudLayer);
  const glowMaterial = new THREE.ShaderMaterial({transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
   uniforms: {color: {value: new THREE.Color('#587ec6')}},
   vertexShader: 'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p;}',
   fragmentShader: 'varying vec3 n; varying vec3 v; uniform vec3 color; void main(){float glow=pow(max(0.,.65+dot(normalize(n),normalize(v))),3.); gl_FragColor=vec4(color,glow*.8);}',
  });
  materials.add(glowMaterial);
  const glow = new THREE.Mesh(sphere, glowMaterial); glow.scale.setScalar(1.1); world.add(glow);
  const pointCount = innerWidth < 700 ? 180 : 440;
  const points = new Float32Array(pointCount * 3);
  for (let i = 0; i < pointCount; i++) {
   // Stable pseudo-random positions keep the field identical across visits.
   const noise = (seed: number) => {const n = Math.sin(seed * 127.1) * 43758.5453; return n - Math.floor(n);};
   points.set([(noise(i + 1) - .5) * 18, (noise(i + 800) - .5) * 12, -3 - noise(i + 400) * 10], i * 3);
  }
  const starsGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(points, 3)); geometries.add(starsGeometry);
  const starsMaterial = new THREE.PointsMaterial({color: '#8fabe0', size: .022, transparent: true, opacity: .6, depthWrite: false}); materials.add(starsMaterial);
  const stars = new THREE.Points(starsGeometry, starsMaterial); scene.add(stars);
  const sample = (p: number, values: number[]) => {
   const section = Math.min(2, Math.floor(p * 3)); const t = Math.min(1, Math.max(0, p * 3 - section)); const smooth = t * t * (3 - 2 * t);
   return THREE.MathUtils.lerp(values[section], values[section + 1], smooth);
  };
  const render = (now: number) => {
   if (dead || lost) return;
   const dt = Math.min((now - previous) / 1000 || 0, .05); previous = now;
   const animated = !paused && !reducedMotion.matches;
   const target = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
   if (animated) {phase += dt * .025; progress += (target - progress) * Math.min(1, dt * 4);}
   else if (reducedMotion.matches) progress = 0;
   const mobile = innerWidth < 700;
   world.position.set(sample(progress, [0, -3.1, 3.2, 0]) * (mobile ? .35 : 1), sample(progress, [-3.45, -.3, .1, -1.2]), 0);
   world.scale.setScalar(sample(progress, [mobile ? 1.2 : 1.65, .9, .85, 1.15]));
   globe.rotation.y = 2.07 + phase + progress * Math.PI * 1.6;
   cloudLayer.rotation.y = phase * 1.8;
   stars.rotation.z = phase * .08;
   renderer.render(scene, camera);
   if (animated && !document.hidden) frame = requestAnimationFrame(render);
  };
  const restart = () => {cancelAnimationFrame(frame); previous = performance.now(); render(previous);};
  const resize = () => {renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5)); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); restart();};
  const theme = () => {dark = document.documentElement.classList.contains('dark'); starsMaterial.opacity = dark ? .65 : .3; restart();};
  const themeObserver = new MutationObserver(theme); themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
  const visibility = () => {if (document.hidden) cancelAnimationFrame(frame); else restart();};
  const contextLost = (event: Event) => {event.preventDefault(); lost = true; cancelAnimationFrame(frame); delete canvas.dataset.ready;};
  const contextRestored = () => {lost = false; canvas.dataset.ready = 'true'; restart();};
  canvas.addEventListener('webglcontextlost', contextLost); canvas.addEventListener('webglcontextrestored', contextRestored);
  window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility); reducedMotion.addEventListener('change', restart);
  theme(); resize(); canvas.dataset.ready = 'true';
  return {setPaused(value: boolean) {paused = value; restart();}, dispose() {
   dead = true; cancelAnimationFrame(frame); themeObserver.disconnect();
   window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); reducedMotion.removeEventListener('change', restart);
   canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
   delete canvas.dataset.ready; disposeResources(); draco.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }};
 } catch {
  disposeResources(); draco.dispose(); renderer.dispose(); renderer.forceContextLoss(); return null;
 }
}
