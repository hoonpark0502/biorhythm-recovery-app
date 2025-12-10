import React, { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Character(props) {
    const group = useRef();
    // Load the GLB model. Note the URL encoding for the space in filename
    const { nodes, materials, animations } = useGLTF('/models/little%20gir3.glb');
    const { actions } = useAnimations(animations, group);

    // If there are animations, play the first one as idle by default
    React.useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            // Play first animation found
            const firstAction = Object.values(actions)[0];
            firstAction.reset().fadeIn(0.5).play();
        }
    }, [actions]);

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={nodes.Scene} />
        </group>
    );
}

useGLTF.preload('/models/little%20gir3.glb');
