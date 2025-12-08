import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const Star = ({ position, data, isNight }) => {
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

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* Star Shape */}
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshBasicMaterial
                    color={isNight ? "gold" : "white"}
                    transparent
                    opacity={isNight ? 0.9 : 0.2}
                />
            </mesh>
            {hovered && isNight && (
                <Html distanceFactor={10}>
                    <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap' }}>
                        Thrown on: {new Date(data.plantedAt).toLocaleDateString()}
                    </div>
                </Html>
            )}
        </group>
    );
};

const StarSystem = ({ items, isNight }) => {
    return (
        <group>
            {items.map((item, i) => (
                <Star key={item.id} position={item.position} data={item} isNight={isNight} />
            ))}
        </group>
    );
};

export default StarSystem;
