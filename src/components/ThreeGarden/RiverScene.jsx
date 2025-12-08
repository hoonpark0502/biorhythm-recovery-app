import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, OrbitControls, Cloud, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FlowingWater = () => {
    return (
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100, 64, 64]} />
            <MeshDistortMaterial
                color="#006994"
                speed={2} // Faster animation for flow feel
                distort={0.4} // Moderate distortion for ripples
                radius={1}
                roughness={0.1}
                metalness={0.8}
                opacity={0.8}
                transparent={true}
            />
        </mesh>
    );
};

const MovingParticle = ({ x, y, z, speed }) => {
    const ref = useRef();
    const initialZ = z;

    useFrame(({ clock }) => {
        if (ref.current) {
            // Move along Z (negative is downstream)
            ref.current.position.z -= speed;
            // Reset if too far
            if (ref.current.position.z < -30) {
                ref.current.position.z = 20;
            }
        }
    });

    return (
        <mesh ref={ref} position={[x, y, initialZ]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
    );
}

const FlowParticles = () => {
    // Simulate "flow" by moving particles along Z
    const count = 50;

    // Random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20; // Width of river
            const y = -1.8; // Surface level
            const z = (Math.random() - 0.5) * 40; // Length
            const speed = 0.05 + Math.random() * 0.1;
            temp.push({ x, y, z, speed });
        }
        return temp;
    }, []);

    return (
        <group>
            {particles.map((p, i) => <MovingParticle key={i} {...p} />)}
        </group>
    );
};

const Terrain = () => {
    return (
        <group position={[0, -2.5, 0]}>
            {/* Left Bank */}
            <mesh position={[-14, 1, 0]} rotation={[-Math.PI / 2, 0, 0.1]}>
                <planeGeometry args={[20, 100, 20, 20]} />
                <meshStandardMaterial color="#3b5e40" roughness={0.9} />
            </mesh>
            {/* Right Bank */}
            <mesh position={[14, 1, 0]} rotation={[-Math.PI / 2, 0, -0.1]}>
                <planeGeometry args={[20, 100, 20, 20]} />
                <meshStandardMaterial color="#3b5e40" roughness={0.9} />
            </mesh>
        </group>
    );
}

const DayNightCycle = ({ isNight }) => {
    // Animate sun position
    const sunPos = isNight ? [0, -10, -50] : [100, 20, 100];

    return (
        <>
            <Sky sunPosition={sunPos} inclination={0} azimuth={0.25} turbidity={8} rayleigh={isNight ? 0.1 : 5} mieCoefficient={0.005} mieDirectionalG={0.8} />
            {isNight && <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            {!isNight && <Cloud opacity={0.6} speed={0.4} width={20} depth={5} segments={10} position={[0, 15, -20]} />}

            {/* Fog for depth - thicker at night */}
            <fog attach="fog" args={[isNight ? '#050a14' : '#ffffff', 5, 40]} />
        </>
    );
};

const RiverScene = ({ children, isNight = false }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
                <DayNightCycle isNight={isNight} />

                {/* Lights */}
                <ambientLight intensity={isNight ? 0.1 : 0.6} />
                <directionalLight position={[10, 20, 10]} intensity={isNight ? 0.2 : 1.5} color={isNight ? "#aaccee" : "#ffeedd"} castShadow />
                {isNight && <pointLight position={[0, 5, 5]} intensity={0.8} color="#8888ff" distance={20} />}

                <FlowingWater />
                <FlowParticles />
                <Terrain />

                {children}

                {/* Restricted Controls */}
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.2} // Prevent seeing under water
                    minAzimuthAngle={-Math.PI / 6}
                    maxAzimuthAngle={Math.PI / 6}
                    minDistance={5}
                    maxDistance={25}
                />
            </Canvas>
        </div>
    );
};

export default RiverScene;
