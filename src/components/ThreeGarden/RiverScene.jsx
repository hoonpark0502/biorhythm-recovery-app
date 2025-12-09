import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls, Html, Sky } from '@react-three/drei';

/**
 * 달 모양 + 약간의 발광
 */
function Moon() {
    return (
        <mesh position={[6, 8, -10]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial emissive="#ffe8b3" emissiveIntensity={1.2} color="#fff7d9" />
        </mesh>
    );
}

function LowPolyTree({ position }) {
    return (
        <group position={position}>
            {/* 줄기 */}
            <mesh castShadow position={[0, 0.75, 0]}>
                <cylinderGeometry args={[0.15, 0.25, 1.5, 6]} />
                <meshStandardMaterial color="#5c3b1f" />
            </mesh>
            {/* 잎 */}
            <mesh castShadow position={[0, 1.7, 0]}>
                <coneGeometry args={[0.9, 1.6, 7]} />
                <meshStandardMaterial color="#1f7a4a" />
            </mesh>
        </group>
    );
}

function Rock({ position }) {
    return (
        <mesh castShadow position={position}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#6d7c8a" roughness={0.9} />
        </mesh>
    );
}

/**
 * 단순화된 숲 / 배경 지형
 */
function Environment() {
    const trees = [];
    // Deterministic random for consistent React renders logic (or just simple static list)
    // Using a few hardcoded positions for better composition than pure random in loop
    const treePositions = [
        [-5, 0, -5], [5, 0, -6], [-7, 0, 2], [8, 0, 3],
        [-3, 0, 6], [6, 0, 7], [-8, 0, -2], [7, 0, -3],
        [-2, 0, -7], [4, 0, -8]
    ];

    return (
        <>
            {/* 잔디 평면 */}
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#1e4730" />
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
 * 강 (물 표면)
 */
function River() {
    return (
        <mesh
            receiveShadow
            rotation-x={-Math.PI / 2}
            position={[0, 0.01, 0]} // Slightly above grass to prevent z-fight
        >
            {/* 폭 6, 길이 20 정도의 물 */}
            <planeGeometry args={[6, 20, 32, 32]} />
            <meshStandardMaterial
                color="#1a3f66"
                transparent
                opacity={0.85}
                roughness={0.3}
                metalness={0.4}
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
            <mesh
                key={i}
                castShadow
                position={[i * 0.6, 0.25, 0]}
            >
                <boxGeometry args={[0.55, 0.15, 2.8]} />
                <meshStandardMaterial color="#7b4a2d" roughness={0.7} />
            </mesh>
        );
    }

    return <group>{planks}</group>;
}

/**
 * 빨간 후드 캐릭터 (심플 스타일)
 */
function LittleHoodCharacter({ position }) {
    return (
        <group position={position}>
            {/* 다리 */}
            <mesh castShadow position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
                <meshStandardMaterial color="#2b1c3a" />
            </mesh>
            {/* 몸통 + 망토 */}
            <mesh castShadow position={[0, 0.75, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#e14141" />
            </mesh>
            {/* 머리 */}
            <mesh castShadow position={[0, 1.15, 0]}>
                <sphereGeometry args={[0.32, 16, 16]} />
                <meshStandardMaterial color="#f4d2b0" />
            </mesh>
            {/* 후드 */}
            <mesh castShadow position={[0, 1.18, -0.03]}>
                <sphereGeometry args={[0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.2]} />
                <meshStandardMaterial color="#e14141" />
            </mesh>
            {/* 눈/표정은 Html로 단순 표현 */}
            <Html center position={[0, 1.15, 0.28]} style={{ pointerEvents: "none" }}>
                <div
                    style={{
                        fontSize: "10px",
                        color: "#3b2c26",
                        transform: "translateY(-6px)",
                        whiteSpace: 'nowrap'
                    }}
                >
                    • •
                </div>
            </Html>
        </group>
    );
}

const RiverScene = ({ children }) => {
    return (
        <div style={{ width: "100%", height: "100vh", position: 'absolute', top: 0, left: 0, background: "#050b1a" }}>
            <Canvas
                camera={{ position: [0, 4, 10], fov: 45 }}
                shadows
            >
                <color attach="background" args={["#050b1a"]} />
                <ambientLight intensity={0.5} />
                <directionalLight
                    castShadow
                    position={[5, 10, 5]}
                    intensity={1.2}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                {/* 밤하늘 별 */}
                <Stars radius={80} depth={40} count={4000} factor={4} fade />

                {/* 달 비슷한 조명 */}
                <Moon />

                {/* 카메라 컨트롤 */}
                <OrbitControls enablePan={false} minPolarAngle={0.4} maxPolarAngle={1.2} />

                {/* 배경 숲 + 지형 */}
                <Environment />

                {/* 강 + 다리 */}
                <River />
                <Bridge />

                {/* 캐릭터 (단순화된 형태) */}
                <LittleHoodCharacter position={[-2.2, 0, 0]} />

                {/* 바닥 그림자 받는 평면 (Extend shadows) */}
                <mesh
                    receiveShadow
                    rotation-x={-Math.PI / 2}
                    position={[0, -0.02, 0]} // Lowest layer
                >
                    <planeGeometry args={[100, 100]} />
                    <shadowMaterial transparent opacity={0.25} />
                </mesh>

                {/* Children (e.g., ThoughtObjects) */}
                {children}

            </Canvas>
        </div>
    );
};

export default RiverScene;
