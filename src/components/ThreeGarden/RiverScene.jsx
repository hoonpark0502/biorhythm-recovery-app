import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, OrbitControls, Cloud, MeshDistortMaterial, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const FlowingWater = () => {
    return (
        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100, 128, 128]} />
            <MeshDistortMaterial
                color="#0f172a" // Deep, Dark Night Blue
                speed={1.5}
                distort={0.3}
                radius={1}
                roughness={0.1} // Reflective
                metalness={0.8}
                opacity={0.9}
                transparent
            />
        </mesh>
    );
};

const DetailedBridge = () => {
    // Generate planks
    const planks = useMemo(() => {
        const items = [];
        for (let i = -4; i <= 4; i += 0.6) {
            items.push(i);
        }
        return items;
    }, []);

    return (
        <group position={[0, -2.2, 0]}>
            {/* Arched Support beams */}
            <mesh position={[0, -0.2, 0]} receiveShadow>
                <boxGeometry args={[9, 0.3, 2.5]} />
                <meshStandardMaterial color="#451a03" />
            </mesh>

            {/* Individual Planks */}
            {planks.map((x, i) => (
                <mesh key={i} position={[x, 0.1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.1, 3]} />
                    <meshStandardMaterial color="#78350f" roughness={1} />
                </mesh>
            ))}

            {/* Railings */}
            <group position={[0, 0.5, 1.4]}>
                <mesh position={[0, 0.6, 0]}><boxGeometry args={[9, 0.15, 0.15]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[-4, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[4, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
            </group>
            <group position={[0, 0.5, -1.4]}>
                <mesh position={[0, 0.6, 0]}><boxGeometry args={[9, 0.15, 0.15]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[-4, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[4, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><meshStandardMaterial color="#451a03" /></mesh>
            </group>
        </group>
    );
};

const StylizedTree = ({ position, scale = 1 }) => (
    <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
            <meshStandardMaterial color="#3f2e18" />
        </mesh>
        {/* Layers of leaves */}
        <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[1.5, 2, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.2, 2, 7]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[0.8, 1.5, 7]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
    </group>
);

const StylizedRock = ({ position, scale = 1, rotation }) => (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
    </mesh>
);

const Environment = () => (
    <group>
        {/* Left Bank */}
        <group position={[-12, -2.5, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0.1]} receiveShadow>
                <planeGeometry args={[20, 100]} />
                <meshStandardMaterial color="#064e3b" />
            </mesh>
            <StylizedTree position={[3, 0, -4]} scale={1.2} />
            <StylizedTree position={[5, 0, 4]} scale={1.5} />
            <StylizedTree position={[7, 0, -2]} scale={0.8} />
            <StylizedRock position={[9, 0.5, 2]} scale={[1.5, 0.8, 1.2]} rotation={[0, 0.5, 0]} />
            <StylizedRock position={[2, 0.2, 5]} scale={[0.5, 0.3, 0.5]} />
        </group>

        {/* Right Bank */}
        <group position={[12, -2.5, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, -0.1]} receiveShadow>
                <planeGeometry args={[20, 100]} />
                <meshStandardMaterial color="#064e3b" />
            </mesh>
            <StylizedTree position={[-3, 0, 2]} scale={1.3} />
            <StylizedTree position={[-6, 0, -5]} scale={1.6} />
            <StylizedTree position={[-8, 0, 0]} scale={0.9} />
            <StylizedRock position={[-5, 0.5, -2]} scale={[2, 1, 1.5]} rotation={[0, -0.2, 0.1]} />
        </group>
    </group>
);

const RiverScene = ({ children, isNight = true }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            {/* Camera: Slightly higher and tilted down for a diorama look */}
            <Canvas shadows camera={{ position: [0, 6, 14], fov: 40 }}>
                {/* 1. ATMOSPHERE */}
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 5, 40]} />

                <Sky
                    sunPosition={isNight ? [0, -10, -50] : [100, 20, 100]}
                    turbidity={0.1}
                    rayleigh={isNight ? 0.01 : 1}
                    mieCoefficient={0.005}
                    mieDirectionalG={0.8}
                    inclination={0.6} azimuth={0.25}
                />

                {isNight && (
                    <>
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        {/* Magical ambient particles */}
                        <Sparkles count={50} scale={20} size={2} speed={0.4} opacity={0.5} color="#a5f3fc" />
                    </>
                )}

                {/* 2. LIGHTING */}
                <ambientLight intensity={isNight ? 0.2 : 0.6} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={isNight ? 0.5 : 1.5}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                {/* Rim Light for magic feel */}
                <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={2} color="#818cf8" />
                {/* Bridge Light */}
                <pointLight position={[0, 2, 0]} intensity={1} distance={10} color="#fbbf24" decay={2} />


                {/* 3. SCENE */}
                <DetailedBridge />
                <Environment />
                <FlowingWater />

                {children}

                <OrbitControls
                    target={[0, 0, 0]}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.2}
                    minAzimuthAngle={-Math.PI / 6}
                    maxAzimuthAngle={Math.PI / 6}
                    minDistance={10}
                    maxDistance={35}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
};

export default RiverScene;
