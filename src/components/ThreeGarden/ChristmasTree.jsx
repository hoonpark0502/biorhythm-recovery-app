import React, { useRef } from 'react';
import { useStorage } from '../../context/StorageContext';

const ORNAMENT_COLORS = {
    red_ball: 'red',
    gold_star: 'gold',
    lights: 'cyan',
    blue_ball: 'blue'
};

const Ornament = ({ type, position }) => {
    return (
        <mesh position={position}>
            {type === 'gold_star' ? (
                // Simple Star shape (Dodecahedron roughly)
                <dodecahedronGeometry args={[0.2, 0]} />
            ) : (
                // Ball shape
                <sphereGeometry args={[0.15, 16, 16]} />
            )}
            <meshStandardMaterial color={ORNAMENT_COLORS[type] || 'white'} emissive={ORNAMENT_COLORS[type]} emissiveIntensity={0.5} />
        </mesh>
    );
};

const ChristmasTree = () => {
    const { garden } = useStorage();
    const group = useRef();

    return (
        <group ref={group} position={[0, -1, 0]}>
            {/* TRUNK */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>

            {/* LEAVES (3 Stacked Cones) */}
            <mesh position={[0, 1.0, 0]}>
                <coneGeometry args={[1.2, 1.5, 32]} />
                <meshStandardMaterial color="#1B5E20" roughness={0.8} />
            </mesh>
            <mesh position={[0, 2.0, 0]}>
                <coneGeometry args={[1.0, 1.2, 32]} />
                <meshStandardMaterial color="#2E7D32" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.0, 0]}>
                <coneGeometry args={[0.8, 1.0, 32]} />
                <meshStandardMaterial color="#388E3C" roughness={0.8} />
            </mesh>

            {/* STAR ON TOP (Default Decoration if not bought, or separate?) 
                Let's distinct bought star from top star. Or maybe Top Star is the "Tree Topper" item?
                For now, simple tree.
            */}

            {/* ORNAMENTS */}
            {garden.map((item) => (
                <Ornament key={item.id} type={item.type} position={item.position} />
            ))}
        </group>
    );
};

export default ChristmasTree;
