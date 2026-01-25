/**
 * React Three Fiber JSX types for React 19 compatibility
 *
 * This file ensures that R3F JSX elements (group, primitive, ambientLight, etc.)
 * are properly typed when using React 19.
 */

import type { Object3DNode, LightNode, HelperNode } from '@react-three/fiber';
import type * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      primitive: { object: THREE.Object3D; [key: string]: unknown };
      ambientLight: LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      pointLight: LightNode<THREE.PointLight, typeof THREE.PointLight>;
      spotLight: LightNode<THREE.SpotLight, typeof THREE.SpotLight>;
      gridHelper: HelperNode<THREE.GridHelper, typeof THREE.GridHelper>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      boxGeometry: { args?: ConstructorParameters<typeof THREE.BoxGeometry> };
      sphereGeometry: { args?: ConstructorParameters<typeof THREE.SphereGeometry> };
      planeGeometry: { args?: ConstructorParameters<typeof THREE.PlaneGeometry> };
      meshStandardMaterial: { color?: THREE.ColorRepresentation; [key: string]: unknown };
      meshBasicMaterial: { color?: THREE.ColorRepresentation; [key: string]: unknown };
      shadowMaterial: { opacity?: number; [key: string]: unknown };
      /** R3F color element for scene background */
      color: {
        attach?: string;
        args?: [color: THREE.ColorRepresentation];
      };
      /** R3F fog element for scene fog */
      fog: {
        attach?: string;
        args?: [color: THREE.ColorRepresentation, near?: number, far?: number];
      };
    }
  }
}
