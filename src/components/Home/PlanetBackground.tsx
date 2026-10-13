"use client";

import {useEffect, useRef, useState} from 'react';
import styles from '@/app/home.module.css';

export default function PlanetBackground() {
 const canvas = useRef<HTMLCanvasElement>(null);
 const scene = useRef<{dispose: () => void; setPaused: (value: boolean) => void} | null>(null);
 const [paused, setPaused] = useState(false);
 const [ready, setReady] = useState(false);
 const pausedRef = useRef(false);
 useEffect(() => {
  let disposed = false;
  void import('./planetScene').then(({createPlanetScene}) => {
   if (disposed || !canvas.current) return;
   return createPlanetScene(canvas.current).then(instance => {
    if (disposed) instance?.dispose();
    else { scene.current = instance; instance?.setPaused(pausedRef.current); setReady(Boolean(instance)); }
   });
  }).catch(() => { /* Keep the CSS atmosphere when WebGL is unavailable. */ });
  return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
 }, []);
 return <>
  <div className={styles.planetBackground} aria-hidden="true"><div className={styles.planetFallback}/><canvas ref={canvas}/><div className={styles.planetScrim}/></div>
  {ready && <button type="button" className={styles.motionControl} aria-pressed={paused} onClick={() => {
   const next = !paused;
   pausedRef.current = next;
   setPaused(next);
   scene.current?.setPaused(next);
  }}><svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">{paused ? <path d="m6 3 11 7-11 7Z"/> : <path d="M5 3h3v14H5zm7 0h3v14h-3Z"/>}</svg>{paused ? 'Activar fondo' : 'Pausar fondo'}</button>}
 </>;
}
