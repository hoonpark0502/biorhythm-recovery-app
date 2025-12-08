import React, { useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useTexture } from '@react-three/drei';

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
                <dodecahedronGeometry args={[0.15, 0]} />
            ) : (
                <sphereGeometry args={[0.12, 16, 16]} />
            )}
            <meshStandardMaterial color={ORNAMENT_COLORS[type] || 'white'} emissive={ORNAMENT_COLORS[type]} emissiveIntensity={0.6} />
        </mesh>
    );
};

const ChristmasTree = () => {
    const { garden } = useStorage();
    const group = useRef();

    // Load the 2D Tree Sprite
    const texture = useTexture('/tree.png');

    return (
        <group ref={group} position={[0, -1.5, 0]}>
            {/* 2.5D BILLBOARD TREE */}
            {/* Aspect Ratio of image? Assuming rough square or vertical. 
                Let's make it 4 units tall. */}
            <mesh position={[0, 2, 0]}>
                <planeGeometry args={[4, 4]} />
                <meshStandardMaterial
                    map={texture}
                    transparent={true}
                    alphaTest={0.5}
                    side={2} // DoubleSide 
                />
            </mesh>

            {/* ORNAMENTS */}
            {/* Z position must be > 0. Let's start ornaments at Z=0.1 to be in front of plane */}
            {garden.map((item) => (
                <Ornament key={item.id} type={item.type} position={item.position} />
            ))}
        </group>
    );
};

export default ChristmasTree;
