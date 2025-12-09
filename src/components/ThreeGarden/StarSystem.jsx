import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

// V2 Star that moves the GROUP so HTML follows
const AscendingStar = ({ position: initialPos, data, isNight, onSelect, texture }) => {
    const groupRef = useRef();
    const spriteRef = useRef();
    const [hovered, setHover] = React.useState(false);
    const seed = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            const cycleTime = 40 + (seed % 20); // Random speed 40-60s
            const progress = ((time + seed) % cycleTime) / cycleTime;

            const currentY = -1.5 + (progress * 12); // Up to 10.5 height

            const driftX = Math.sin(time * 0.5 + seed) * 1.5;
            const driftZ = Math.cos(time * 0.3 + seed) * 1.0;

            groupRef.current.position.set(
                initialPos[0] + driftX,
                currentY,
                initialPos[2] + driftZ
            );

            // Opacity Logic
            let opacity = 1;
            if (progress < 0.1) opacity = progress * 10;
            if (progress > 0.8) opacity = (1 - progress) * 5;

            spriteRef.current.material.opacity = (isNight ? (hovered ? 1 : 0.9) : 0.3) * opacity;

            // Pulse
            const scale = (hovered ? 2.5 : 2.0) + Math.sin(time * 3 + seed) * 0.3;
            spriteRef.current.scale.set(scale, scale, 1);
        }
    });

    return (
        <group ref={groupRef}>
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

            {hovered && isNight && (
                <Html distanceFactor={15} position={[0, 1.5, 0]}>
                    <div className="fade-in" style={{
                        background: 'rgba(15, 23, 42, 0.9)', color: '#F1F5F9',
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                        whiteSpace: 'nowrap', pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{new Date(data.plantedAt).toLocaleDateString()}</div>
                        <div style={{ fontWeight: '600' }}>{data.originType === 'stone' ? '🪨 Stone' :
                            data.originType === 'pebble' ? '⚪ Pebble' : '🌿 Branch'}</div>
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
