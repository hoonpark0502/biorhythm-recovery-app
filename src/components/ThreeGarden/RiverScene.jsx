import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, OrbitControls, Cloud, MeshDistortMaterial, Cone } from '@react-three/drei';
import * as THREE from 'three';

const FlowingWater = () => {
    return (
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100, 64, 64]} />
            <MeshDistortMaterial
                color="#1E3A8A" // Deep Blue
                speed={2}
                distort={0.4}
                radius={1}
                roughness={0.2}
                metalness={0.6}
                opacity={0.9}
                transparent={true}
            />
        </mesh>
    );
};

const Bridge = () => {
    // Simple Wooden Bridge
    return (
        <group position={[0, -1.8, 0]}>
            {/* Main Planks */}
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
                <boxGeometry args={[6, 0.2, 3]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            {/* Posts */}
            <mesh position={[-2.5, -0.5, 1.2]}><cylinderGeometry args={[0.2, 0.2, 2]} /><meshStandardMaterial color="#552200" /></mesh>
            <mesh position={[2.5, -0.5, 1.2]}><cylinderGeometry args={[0.2, 0.2, 2]} /><meshStandardMaterial color="#552200" /></mesh>
            <mesh position={[-2.5, -0.5, -1.2]}><cylinderGeometry args={[0.2, 0.2, 2]} /><meshStandardMaterial color="#552200" /></mesh>
            <mesh position={[2.5, -0.5, -1.2]}><cylinderGeometry args={[0.2, 0.2, 2]} /><meshStandardMaterial color="#552200" /></mesh>
        </group>
    );
};

const Tree = ({ position, scale = 1, color = "#166534" }) => (
    <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
            <meshStandardMaterial color="#3f2e18" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow>
            <coneGeometry args={[1.2, 2.5, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
    </group>
);

const Rock = ({ position, scale = 1 }) => (
    <mesh position={position} scale={scale} rotation={[Math.random(), Math.random(), Math.random()]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#64748b" flatShading />
    </mesh>
);

const Environment = () => (
    <group>
        {/* Left Bank */}
        <group position={[-12, -2, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0.1]} receiveShadow>
                <planeGeometry args={[20, 100]} />
                <meshStandardMaterial color="#064e3b" />
            </mesh>
            <Tree position={[2, 0, -5]} scale={1.2} />
            <Tree position={[5, 0, 5]} scale={0.8} color="#14532d" />
            <Rock position={[8, 0.5, 2]} />
        </group>

        {/* Right Bank */}
        <group position={[12, -2, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, -0.1]} receiveShadow>
                <planeGeometry args={[20, 100]} />
                <meshStandardMaterial color="#064e3b" />
            </mesh>
            <Tree position={[-3, 0, 3]} scale={1.5} />
            <Tree position={[-6, 0, -8]} scale={1} color="#14532d" />
            <Rock position={[-5, 0.5, -2]} scale={1.5} />
        </group>
    </group>
);

const Landscape = ({ isNight }) => {
    return (
        <group>
            <Sky sunPosition={isNight ? [0, -10, -50] : [100, 20, 100]} inclination={0.6} azimuth={0.1} />
            {isNight && <Stars radius={80} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
            <ambientLight intensity={isNight ? 0.3 : 0.7} />
            <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
            {/* Moonlight */}
            {isNight && <pointLight position={[-10, 15, -10]} intensity={2} color="#a5f3fc" distance={50} />}

            <Bridge />
            <Environment />
            <FlowingWater />
        </group>
    );
};

const RiverScene = ({ children, isNight = true }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            {/* Fixed Isometric Camera Angle */}
            <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
                <Landscape isNight={isNight} />
                {children}

                {/* Restricted Controls - Allow slight rotation but keep focus on bridge */}
                <OrbitControls
                    target={[0, 0, 0]}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 3}
                    minAzimuthAngle={-Math.PI / 6}
                    maxAzimuthAngle={Math.PI / 6}
                    minDistance={10}
                    maxDistance={30}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
};

export default RiverScene;
