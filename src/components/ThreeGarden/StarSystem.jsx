import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Generate a "Glow" texture on the fly
const useGlowTexture = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Radial Gradient: White Core -> Core Color -> Transparent
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Core
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)'); // Inner Glow
        gradient.addColorStop(0.5, 'rgba(255, 220, 180, 0.2)'); // Outer Glow
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent Edge

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);
};

// V3 Magical Floating Star
const AscendingStar = ({ position: initialPos, data, isNight, onSelect, texture }) => {
    const groupRef = useRef();
    const spriteRef = useRef();
    const [hovered, setHover] = React.useState(false);
    const seed = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            const cycleTime = 40 + (seed % 20); // Random speed 40-60s
            // Loop smoothly
            const progress = ((time + seed) % cycleTime) / cycleTime;

            // Magical Curve: "Snake" path going up
            // Start at y = -2 (water), End at y = 14 (sky)
            const y = -2 + (progress * 16);

            // X and Z follow a gentle sine wave that widens slightly as it goes up
            const driftScale = 1 + (progress * 2);
            const x = initialPos[0] + Math.sin(time * 0.5 + seed) * 1.5 * driftScale;
            const z = initialPos[2] + Math.cos(time * 0.3 + seed) * 1.0 * driftScale;

            groupRef.current.position.set(x, y, z);

            // Opacity Logic: Fade in quickly, Fade out slowly at top
            let opacity = 1;
            if (progress < 0.05) opacity = progress * 20;
            if (progress > 0.8) opacity = (1 - progress) * 5;

            if (spriteRef.current) {
                spriteRef.current.material.opacity = (isNight ? (hovered ? 1 : 0.8) : 0.3) * opacity;

                // Pulse size
                const scale = (hovered ? 2.5 : 2.0) + Math.sin(time * 3 + seed) * 0.2;
                spriteRef.current.scale.set(scale, scale, 1);
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* Trail Effect for the magical stream feel */}
            {isNight && (
                <Trail
                    width={1.5}
                    length={4}
                    color={new THREE.Color("#a5f3fc")}
                    attenuation={(t) => t * t}
                >
                    <mesh visible={false}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                    </mesh>
                </Trail>
            )}

            {/* Little glitter particles around the star */}
            {isNight && (
                <Sparkles count={6} scale={1.5} size={1.5} speed={0.4} opacity={0.5} color="#fbbf24" />
            )}

            <sprite
                ref={spriteRef}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
                onClick={(e) => { e.stopPropagation(); onSelect(data); }}
            >
                <spriteMaterial
                    attach="material"
                    map={texture}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    color={hovered ? "#FFF" : (isNight ? "#FCD34D" : "#FFFFFF")}
                />
            </sprite>

            {/* Minimal Hover Label */}
            {hovered && isNight && (
                <Html distanceFactor={15} position={[0, 1.5, 0]}>
                    <div className="fade-in" style={{
                        background: 'rgba(15, 23, 42, 0.95)', color: '#F1F5F9',
                        padding: '8px 12px', borderRadius: '12px', fontSize: '12px',
                        whiteSpace: 'nowrap', pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
                    }}>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{new Date(data.plantedAt).toLocaleDateString()}</div>
                        <div style={{ fontWeight: '700', color: '#fbbf24' }}>
                            {data.originType === 'stone' ? 'Stone' :
                                data.originType === 'pebble' ? 'Pebble' : 'Branch'}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const StarSystem = ({ items, isNight, onSelectStar }) => {
    const glowTexture = useGlowTexture();

    return (
        <group>
            {items.map((item, i) => (
                <AscendingStar
                    key={item.id}
                    position={item.position}
                    data={item}
                    isNight={isNight}
                    onSelect={onSelectStar}
                    texture={glowTexture}
                />
            ))}
        </group>
    );
};

export default StarSystem;
