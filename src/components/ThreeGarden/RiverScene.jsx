import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Stars, OrbitControls, Html, Sky, Sparkles, Float, Tube } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Character from './Character';

// --- Magic Swirl Geometry ---
// Tube geometry along a spiral curve
const MagicSwirl = ({ visible, color = "#a5f3fc" }) => {
    const curve = useMemo(() => {
        // Create a spiral curve: higher Y as radius expands/contracts
        const points = [];
        for (let t = 0; t < 5; t += 0.1) {
            const r = 0.5 + t * 0.5; // Radius
            const x = Math.cos(t * Math.PI * 2) * r;
            const z = Math.sin(t * Math.PI * 2) * r;
            const y = t * 3;
            points.push(new THREE.Vector3(x, y, z));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    const matRef = useRef();

    useFrame((state) => {
        if (matRef.current) {
            // Pulse emissive intensity
            matRef.current.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 1;
            // Scroll texture if we had one, but simple color focus for now
        }
    });

    if (!visible) return null;

    return (
        <mesh position={[0, -1, 0]}>
            <tubeGeometry args={[curve, 64, 0.1, 8, false]} />
            <meshStandardMaterial
                ref={matRef}
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};

/**
 * 달 모양 + 강력한 발광 (Bloom 대상)
 */
function Moon() {
    return (
        <mesh position={[6, 8, -10]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial
                emissive="#ffe8b3"
                emissiveIntensity={4} // High intensity for Bloom
                color="#fff7d9"
                toneMapped={false} // Key for good bloom
            />
        </mesh>
    );
}

function LowPolyTree({ position }) {
    return (
        <group position={position}>
            {/* 줄기 */}
            <mesh castShadow position={[0, 0.75, 0]}>
                <cylinderGeometry args={[0.15, 0.25, 1.5, 6]} />
                <meshStandardMaterial color="#2d1b0e" />
            </mesh>
            {/* 잎 */}
            <mesh castShadow position={[0, 1.7, 0]}>
                <coneGeometry args={[0.9, 1.6, 7]} />
                <meshStandardMaterial color="#0f3d24" roughness={0.8} />
            </mesh>
        </group>
    );
}

function Rock({ position }) {
    return (
        <mesh castShadow position={position}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
    );
}

/**
 * 단순화된 숲 / 배경 지형
 */
function Environment() {
    const treePositions = [
        [-5, 0, -5], [5, 0, -6], [-7, 0, 2], [8, 0, 3],
        [-3, 0, 6], [6, 0, 7], [-8, 0, -2], [7, 0, -3],
        [-2, 0, -7], [4, 0, -8]
    ];

    return (
        <>
            {/* 잔디 평면 - Darker Green */}
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#062c18" roughness={1} />
            </mesh>

            {/* 나무들 */}
            {treePositions.map((pos, i) => <LowPolyTree key={i} position={pos} />)}

            {/* 주변 바위 */}
            <Rock position={[3, 0, 2]} />
            <Rock position={[-4, 0, -3]} />
            <Rock position={[5, 0, -1]} />
            <Rock position={[-6, 0, 4]} />
        </>
    );
}

/**
 * 강 (물 표면) - Darker, Reflective
 */
function River() {
    return (
        <mesh
            receiveShadow
            rotation-x={-Math.PI / 2}
            position={[0, 0.01, 0]}
        >
            <planeGeometry args={[6, 20, 32, 32]} />
            <meshStandardMaterial
                color="#0f172a"
                emissive="#0f172a"
                emissiveIntensity={0.2}
                transparent
                opacity={0.9}
                roughness={0.1}
                metalness={0.8}
            />
        </mesh>
    );
}

/**
 * 나무 다리
 */
function Bridge() {
    const planks = [];
    for (let i = -3; i <= 3; i++) {
        planks.push(
            <mesh key={i} castShadow position={[i * 0.6, 0.25, 0]}>
                <boxGeometry args={[0.55, 0.15, 2.8]} />
                <meshStandardMaterial color="#3f2312" roughness={0.9} />
            </mesh>
        );
    }
    return <group>{planks}</group>;
}

const RiverScene = ({ children, isNight = true }) => {
    // Colors based on Day/Night
    const bgColor = isNight ? "#02040a" : "#87ceeb";
    const fogColor = isNight ? "#02040a" : "#e0f2fe";
    const ambientInt = isNight ? 0.5 : 1.5;
    const directInt = isNight ? 1.2 : 2.5;

    return (
        <div style={{ width: "100%", height: "100vh", position: 'absolute', top: 0, left: 0, background: bgColor, transition: 'background 1s ease' }}>
            <Canvas
                camera={{ position: [0, 5, 12], fov: 40 }}
                shadows
                dpr={[1, 2]} // Quality
            >
                {/* 1. MOOD ATMOSPHERE */}
                <color attach="background" args={[bgColor]} />
                <fog attach="fog" args={[fogColor, 5, isNight ? 30 : 50]} />

                {/* 2. LIGHTING (Cinematic) */}
                <ambientLight intensity={ambientInt} color={isNight ? "#a5f3fc" : "#ffffff"} />
                <directionalLight
                    castShadow
                    position={[5, 10, 5]}
                    intensity={directInt}
                    color={isNight ? "#e0f2fe" : "#fff7ed"}
                    shadow-mapSize={[1024, 1024]}
                />
                {/* Rim Light for Character */}
                <spotLight position={[-5, 5, 0]} intensity={isNight ? 3 : 1} color={isNight ? "#818cf8" : "#fbbf24"} angle={0.5} penumbra={1} />

                {/* 3. ENVIRONMENT */}
                {isNight && <Stars radius={80} depth={40} count={5000} factor={4} fade saturation={0} />}
                {isNight ? <Moon /> : <Sky sunPosition={[100, 20, 100]} />}

                {/* 4. SCENE OBJECTS */}
                <Environment />
                <River />
                <Bridge />

                {/* 5. CHARACTER (Restored with Crash Fixes) */}
                <group position={[-2, 0.35, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.8}>
                    <Character onPointerOver={null} onClick={null} />
                </group>

                {/* 6. CHILD COMPONENTS (ThoughtObjects) */}
                {children}

                {/* 7. POST PROCESSING (Restored) */}
                <EffectComposer disableNormalPass enabled={true}>
                    <Bloom luminanceThreshold={isNight ? 0.8 : 1.2} mipmapBlur intensity={isNight ? 1.8 : 0.5} radius={0.6} />
                    <Vignette eskil={false} offset={0.1} darkness={isNight ? 1.1 : 0.4} />
                    <Noise opacity={0.02} />
                </EffectComposer>

                {/* Controls */}
                <OrbitControls enablePan={false} minPolarAngle={0.4} maxPolarAngle={1.2} maxDistance={20} minDistance={5} />
            </Canvas>
        </div>
    );
};

export default RiverScene;
