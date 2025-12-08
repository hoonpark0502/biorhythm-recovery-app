import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const Star = ({ position, data, isNight, onSelect }) => {
    const mesh = useRef();

    // Only show stars clearly at night? Or always?
    // Concept: "The objects ... becomes the star in night sky"
    // So maybe transparent during day?

    const [hovered, setHover] = React.useState(false);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.z += 0.01;
            // Twinkle
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
            mesh.current.scale.setScalar(scale);
        }
    });

    const handlePointerOver = (e) => {
        e.stopPropagation(); // Prevent hitting things behind
        setHover(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e) => {
        setHover(false);
        document.body.style.cursor = 'auto';
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelect(data);
    };

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                {/* Star Shape */}
                <dodecahedronGeometry args={[0.3, 0]} /> {/* Slightly bigger click target */}
                <meshBasicMaterial
                    color={hovered ? "#ffdd88" : (isNight ? "gold" : "white")}
                    transparent
                    opacity={isNight ? (hovered ? 1 : 0.8) : 0.2}
                />
            </mesh>
            {/* Simple Label on Hover */}
            {hovered && isNight && (
                <Html distanceFactor={15} position={[0, 0.5, 0]}>
                    <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                        {new Date(data.plantedAt).toLocaleDateString()}
                    </div>
                </Html>
            )}
        </group>
    );
};

const StarSystem = ({ items, isNight, onSelectStar }) => {
    return (
        <group>
            {items.map((item, i) => (
                <Star
                    key={item.id}
                    position={item.position}
                    data={item}
                    isNight={isNight}
                    onSelect={onSelectStar}
                />
            ))}
        </group>
    );
};

export default StarSystem;
