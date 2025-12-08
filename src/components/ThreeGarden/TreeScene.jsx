import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ChristmasTree from './ChristmasTree';

const TreeScene = () => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                {/* AMBIENCE */}
                <color attach="background" args={['#0F172A']} /> {/* Dark Night Sky */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 5, 0]} intensity={0.5} color="orange" />

                {/* STARS BACKGROUND */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* CONTENT */}
                <Suspense fallback={null}>
                    <ChristmasTree />
                </Suspense>

                {/* CONTROLS */}
                <OrbitControls enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} maxDistance={10} minDistance={3} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default TreeScene;
