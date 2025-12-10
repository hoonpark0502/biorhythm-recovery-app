import React, { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Character(props) {
    const group = useRef();
    // Load the GLB model. Note the URL encoding for the space in filename
    const { nodes, materials, animations } = useGLTF('/models/little%20gir3.glb');
    const { actions } = useAnimations(animations || [], group);

    React.useEffect(() => {
        if (actions) {
            const actionValues = Object.values(actions);
            if (actionValues.length > 0) {
                actionValues[0].reset().fadeIn(0.5).play();
            }
        }
    }, [actions]);

    // Debugging
    if (!nodes) {
        console.warn("Character GLTF failed to load nodes");
        return null;
    }
    if (!nodes.Scene) {
        console.warn("Character GLTF missing 'Scene' node. Available:", Object.keys(nodes));
        // Fallback: Try to find a Scene-like object or return null
        return null;
    }

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive object={nodes.Scene} />
        </group>
    );
}

useGLTF.preload('/models/little%20gir3.glb');
