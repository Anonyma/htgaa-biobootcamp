import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere } from '@react-three/drei';
import { Group } from 'three';

interface DNAHelixProps {
  basePairs?: number;
  radius?: number;
  height?: number;
  turns?: number;
}

export function DNAHelix({ basePairs = 20, radius = 1.5, height = 10, turns = 2 }: DNAHelixProps) {
  const groupRef = useRef<Group>(null);

  // Animation: Rotate the entire helix
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const nucleotides = useMemo(() => {
    const items = [];
    const heightPerPair = height / basePairs;
    const anglePerPair = (Math.PI * 2 * turns) / basePairs;

    for (let i = 0; i < basePairs; i++) {
      const y = (i - basePairs / 2) * heightPerPair;
      const angle = i * anglePerPair;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Color coding: A-T (Blue-Red) or G-C (Green-Yellow)
      // Randomly pick a pair type
      const isAT = Math.random() > 0.5;
      const color1 = isAT ? '#3b82f6' : '#10b981'; // Blue or Green
      const color2 = isAT ? '#ef4444' : '#f59e0b'; // Red or Yellow

      items.push({
        id: i,
        position1: [x1, y, z1] as [number, number, number],
        position2: [x2, y, z2] as [number, number, number],
        color1,
        color2,
        y
      });
    }
    return items;
  }, [basePairs, radius, height, turns]);

  return (
    <group ref={groupRef}>
      {nucleotides.map((n) => (
        <group key={n.id}>
          {/* Backbone strands (simplified as spheres for now) */}
          <Sphere position={n.position1} args={[0.2]} >
            <meshStandardMaterial color="#cbd5e1" />
          </Sphere>
          <Sphere position={n.position2} args={[0.2]} >
            <meshStandardMaterial color="#cbd5e1" />
          </Sphere>

          {/* Rung (Connection) */}
          <group position={[0, n.y, 0]} rotation={[0, (Math.PI * 2 * turns * n.id) / basePairs, Math.PI / 2]}>
             {/* Left half */}
            <Cylinder args={[0.08, 0.08, radius, 8]} position={[0, radius/2, 0]}>
              <meshStandardMaterial color={n.color1} />
            </Cylinder>
            {/* Right half */}
            <Cylinder args={[0.08, 0.08, radius, 8]} position={[0, -radius/2, 0]}>
              <meshStandardMaterial color={n.color2} />
            </Cylinder>
          </group>
        </group>
      ))}
    </group>
  );
}
