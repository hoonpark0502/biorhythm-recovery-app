import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 간단한 컵, 책, 시계 형태 – 로우폴리 맛으로
 */
const CupGeometry = () => (
    <group>
        <cylinderGeometry args={[0.25, 0.25, 0.35, 16]} />
    </group>
);

const BookGeometry = () => (
    <boxGeometry args={[0.5, 0.08, 0.35]} />
);

const ClockGeometry = () => (
    <group>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 24]} />
    </group>
);

/**
 * "생각" 오브젝트: 클릭 시
 * 1) 다리 근처에서 -> 강 쪽으로 떨어졌다가 -> 위로 날아가며 -> 하늘의 별로 변신
 */
const ThoughtObject = ({
    kind,
    color,
    start,
    riverTarget,
    skyTarget,
    isPlanted = false, // If true, starts as a star
    onThrow // Callback when throw is confirmed/started
}) => {
    const meshRef = useRef();
    // If planted, start at 'star' phase. If not, 'idle'.
    const [phase, setPhase] = useState(isPlanted ? "star" : "idle");
    const [t, setT] = useState(0);

    // Initial position logic
    useEffect(() => {
        if (isPlanted && meshRef.current) {
            meshRef.current.position.set(...skyTarget);
            // If it's a star, ensure material is emissive immediately
        }
    }, [isPlanted, skyTarget]);

    useFrame((_, delta) => {
        if (phase === "idle" || !meshRef.current) return;

        const speed = 0.7; // 애니메이션 속도

        if (phase === "star") {
            // 하늘의 작은 발광체 - Twinkle
            meshRef.current.scale.setScalar(0.4 + Math.sin(Date.now() * 0.005) * 0.1);
            return;
        }

        // Animation Progress
        const newT = Math.min(t + delta * speed, 1);
        setT(newT);

        if (phase === "toRiver") {
            // start -> riverTarget으로 lerp
            const pos = new THREE.Vector3().fromArray(start);
            const target = new THREE.Vector3().fromArray(riverTarget);
            pos.lerp(target, newT);
            meshRef.current.position.copy(pos);

            // Rotate slightly falling
            meshRef.current.rotation.z += delta * 2;
            meshRef.current.rotation.x += delta;

            if (newT >= 1) {
                setPhase("toSky");
                setT(0);
            }
        } else if (phase === "toSky") {
            // riverTarget -> skyTarget + 약간의 곡선 효과
            const from = new THREE.Vector3().fromArray(riverTarget);
            const to = new THREE.Vector3().fromArray(skyTarget);
            const pos = from.clone().lerp(to, newT);

            // 살짝 나선 느낌으로 흔들기
            pos.x += Math.sin(newT * Math.PI * 2) * 0.3;
            pos.z += Math.cos(newT * Math.PI * 2) * 0.3;

            meshRef.current.position.copy(pos);
            meshRef.current.rotation.y += 0.08;

            // 점점 작아지기
            const s = THREE.MathUtils.lerp(1, 0.4, newT);
            meshRef.current.scale.setScalar(s);

            if (newT >= 1) {
                setPhase("star");
            }
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (phase !== "idle") return; // 이미 던졌거나 별이면 무시
        if (onThrow) {
            const success = onThrow(kind); // Trigger logic (deduct tokens, etc)
            if (success) {
                setPhase("toRiver");
                setT(0);
            }
        }
    };

    const isStar = phase === "star";

    return (
        <group>
            <mesh
                ref={meshRef}
                castShadow
                position={isPlanted ? skyTarget : start}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = phase === "idle" ? 'pointer' : 'default' }}
                onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
                {isStar ? (
                    <icosahedronGeometry args={[0.25, 0]} />
                ) : kind === "cup" ? (
                    <CupGeometry />
                ) : kind === "book" ? (
                    <BookGeometry />
                ) : (
                    <ClockGeometry />
                )}
                <meshStandardMaterial
                    color={color}
                    emissive={isStar ? color : "#000000"}
                    emissiveIntensity={isStar ? 1.5 : 0}
                    roughness={0.5}
                    metalness={0.1}
                />
            </mesh>
        </group>
    );
};

export default ThoughtObject;
