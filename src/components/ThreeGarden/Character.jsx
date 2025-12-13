import React, { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Character(props) {
    const group = useRef();
    // Load the NEWEST GLB model "redhood2.glb" (Fixing box issue)
    const { nodes, materials, animations } = useGLTF('/models/redhood2.glb');
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

    // Log available nodes to help debug
    console.log("Character Nodes (redhood2):", Object.keys(nodes));

    return (
        <group ref={group} {...props} dispose={null}>
            {/* If the model has a specific root scene, use it. Usually nodes.Scene or just primitive of scene */}
            <primitive object={nodes.Scene || nodes.scene} />
        </group>
    );
}

useGLTF.preload('/models/redhood2.glb');
