import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, OrbitControls, Cloud } from '@react-three/drei';
import * as THREE from 'three';

const Water = () => {
    // simple low-poly water or shiny plane
    const ref = useRef();
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1 - 2; // Gentle wave
        }
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[100, 100, 20, 20]} />
            <meshStandardMaterial
                color="#00496A"
                roughness={0.1}
                metalness={0.8}
                opacity={0.8}
                transparent
            />
        </mesh>
    );
};

const Terrain = () => {
    return (
        <group position={[0, -2.5, 0]}>
            {/* Left Bank */}
            <mesh position={[-8, 0, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
                <planeGeometry args={[10, 50]} />
                <meshStandardMaterial color="#2E5E2E" />
            </mesh>
            {/* Right Bank */}
            <mesh position={[8, 0, 0]} rotation={[-Math.PI / 2, 0, -0.2]}>
                <planeGeometry args={[10, 50]} />
                <meshStandardMaterial color="#2E5E2E" />
            </mesh>
        </group>
    );
}

const DayNightCycle = ({ isNight }) => {
    // Animate sun position? For MVP, just flip based on prop
    const sunPos = isNight ? [0, -10, -50] : [100, 20, 100];

    return (
        <>
            <Sky sunPosition={sunPos} inclination={0} azimuth={0.25} turbidity={10} rayleigh={isNight ? 0.1 : 2} mieCoefficient={0.005} mieDirectionalG={0.8} />
            {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            {!isNight && <Cloud opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} position={[0, 10, -10]} />}
        </>
    );
};

const RiverScene = ({ children, isNight = false }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
                <DayNightCycle isNight={isNight} />

                {/* Lights */}
                <ambientLight intensity={isNight ? 0.2 : 0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                {isNight && <pointLight position={[0, 5, 0]} intensity={0.5} color="#aaaaff" />}

                <Water />
                <Terrain />

                {children}

                {/* Restricted Controls: Look around but stay on bank */}
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.9}
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                    minDistance={5}
                    maxDistance={15}
                />
            </Canvas>
        </div>
    );
};

export default RiverScene;
