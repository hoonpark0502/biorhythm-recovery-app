import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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

const Star = ({ position, data, isNight, onSelect, texture }) => {
    const sprite = useRef();
    const [hovered, setHover] = React.useState(false);

    // Randomize initial phase for twinkling
    const phase = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (sprite.current) {
            // Pulsing Glow (Twinkle)
            const time = state.clock.elapsedTime;
            const scaleBase = hovered ? 2.5 : 2.0; // Base size
            const pulse = Math.sin(time * 2 + phase) * 0.3; // Gentle pulse

            const finalScale = scaleBase + pulse;
            sprite.current.scale.set(finalScale, finalScale, 1);

            // Subtle rotation? Sprites always face camera, but we can rotate visual if needed (not for sprite)
        }
    });

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e) => {
        setHover(false);
        document.body.style.cursor = 'auto';
    };

    const handleClick = (e) => {
        e.stopPropagation(); // Stop click-through
        onSelect(data);
    };

    return (
        <group position={position}>
            <sprite
                ref={sprite}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                <spriteMaterial
                    attach="material"
                    map={texture}
                    transparent
                    opacity={isNight ? (hovered ? 1 : 0.9) : 0.3} // Faded during day
                    depthWrite={false} // Additive blending look usually needs this
                    blending={THREE.AdditiveBlending} // Make it GLOW
                    color={hovered ? "#FFF" : (isNight ? "#FFD700" : "#FFFFFF")}
                />
            </sprite>

            {/* Label on Hover */}
            {hovered && isNight && (
                <Html distanceFactor={15} position={[0, 1.5, 0]}>
                    <div className="fade-in" style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: '#F1F5F9',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
                            {new Date(data.plantedAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontWeight: '600' }}>
                            {data.originType === 'stone' ? '🪨 Stone' :
                                data.originType === 'pebble' ? '⚪ Pebble' : '🌿 Branch'}
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
                <Star
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
