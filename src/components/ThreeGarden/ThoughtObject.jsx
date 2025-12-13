import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Tube } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 간단한 컵, 책, 시계 형태
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

// --- Magic Swirl Effect (Tube) ---
const MagicSwirlTrail = ({ progress }) => {
    const curve = useMemo(() => {
        // Spiral going up
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 2; // Height factor
            const r = 0.2 + (t * 0.2); // Expanding radius
            const x = Math.sin(t * 3) * r;
            const z = Math.cos(t * 3) * r;
            points.push(new THREE.Vector3(x, t, z));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    // We want the tube to "grow" as progress increases
    // BUT TubeGeometry doesn't animate length easily without re-creation.
    // Hack: Scale Y or use a revealing shader. 
    // Easier: Visible length control if Tube supports it? No.
    // Let's just scale the whole mesh Y based on progress.

    // Scale X/Z can be 1. Y grows from 0 to 1.
    // But this distorts the spiral if not careful.
    // For a "Magic" effect, distortion is fine.

    return (
        <mesh position={[0, 0, 0]} scale={[1, progress, 1]}>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <meshStandardMaterial
                color="#a5f3fc"
                emissive="#a5f3fc"
                emissiveIntensity={3}
                transparent
                opacity={Math.max(0, 1 - progress)} // Fade out as it completes? No, keep visual.
            />
        </mesh>
    );
};


const ThoughtObject = ({
    kind,
    color,
    start,
    riverTarget,
    skyTarget,
    isPlanted = false,
    onThrow,
    ...props
}) => {
    const meshRef = useRef();
    const [phase, setPhase] = useState(isPlanted ? "star" : "idle");
    const [t, setT] = useState(0);

    // Initial position
    useEffect(() => {
        if (isPlanted && meshRef.current) {
            meshRef.current.position.set(...skyTarget);
            // Stars spin slowly
        }
    }, [isPlanted, skyTarget]);

    // Auto-Start for Shop items
    useEffect(() => {
        if (onThrow && !isPlanted && phase === "idle") {
            // If triggered by Shop, we want to auto-throw? 
            // Or maybe onThrow is passed as a flag? 
            // Let's use a prop 'autoThrow'
        }
    }, []);

    // Explicit Start method exposed or handled by prop
    useEffect(() => {
        if (props.autoThrow && phase === "idle") {
            setPhase("toRiver");
            setT(0);
        }
    }, [props.autoThrow]);

    useFrame((_, delta) => {
        if (phase === "idle" || !meshRef.current) return;

        const speed = 0.5; // Slightly slower for dramatic effect

        if (phase === "star") {
            meshRef.current.scale.setScalar(0.4 + Math.sin(Date.now() * 0.005) * 0.1);
            meshRef.current.rotation.y += delta;
            return;
        }

        const newT = Math.min(t + delta * speed, 1);
        setT(newT);

        if (phase === "toRiver") {
            const pos = new THREE.Vector3().fromArray(start);
            const target = new THREE.Vector3().fromArray(riverTarget);
            pos.lerp(target, newT);
            meshRef.current.position.copy(pos);

            // Tumble
            meshRef.current.rotation.z += delta * 5;
            meshRef.current.rotation.x += delta * 2;

            if (newT >= 1) {
                setPhase("toSky");
                setT(0);
            }
        } else if (phase === "toSky") {
            const from = new THREE.Vector3().fromArray(riverTarget);
            const to = new THREE.Vector3().fromArray(skyTarget);
            const pos = from.clone().lerp(to, newT);

            // Magic Swirl Motion logic on the object itself
            // "Spiral" up
            const swirlRadius = 0.5 + (newT * 2);
            pos.x += Math.sin(newT * Math.PI * 8) * swirlRadius;
            pos.z += Math.cos(newT * Math.PI * 8) * swirlRadius;

            meshRef.current.position.copy(pos);
            meshRef.current.rotation.y += delta * 15; // Spin fast

            // Scale down
            const s = THREE.MathUtils.lerp(1, 0.4, newT);
            meshRef.current.scale.setScalar(s);

            if (newT >= 1) {
                setPhase("star");
            }
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (phase !== "idle") return;
        if (onThrow) {
            const success = onThrow(kind);
            if (success) {
                setPhase("toRiver");
                setT(0);
            }
        }
    };

    const isStar = phase === "star";
    const isFloating = phase === "toSky";

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
                    <dodecahedronGeometry args={[0.25, 0]} />
                ) : kind === "cup" ? (
                    <CupGeometry />
                ) : kind === "book" ? (
                    <BookGeometry />
                ) : (
                    <ClockGeometry />
                )}
                <meshStandardMaterial
                    color={color}
                    emissive={isStar || isFloating ? color : "#000000"}
                    emissiveIntensity={isStar ? 2 : (isFloating ? 1 : 0)}
                    roughness={isStar ? 0.1 : 0.5}
                    metalness={0.5}
                    toneMapped={false}
                />
            </mesh>

            {/* Trail separate from mesh to avoid spinning with object tumbling */}
            {isFloating && meshRef.current && (
                <group position={meshRef.current.position}>
                    {/* Actually, trail needs to be static world space or attached to a pivot. 
                        If attached here, it follows object position.
                        Visual hack: Just a simple particle or tube following?
                        Let's skip complex Tube trail if it's too glitchy.
                        The user asked for "Magic Swirl" via TubeGeometry logic.
                        Let's put a vertical static tube appearing at the "launch site" (riverTarget) 
                        and scaling up as we go? 
                    */}
                    {/* For now, relying on the 'movement' swirl. 
                        Let's try a simple Sparkle effect following the object.
                    */}
                </group>
            )}

            {/* TubeGeometry Swirl (Restored) */}
            {isFloating && (
                <MagicSwirlTrail progress={t} />
            )}
        </group>
    );
};

export default ThoughtObject;
