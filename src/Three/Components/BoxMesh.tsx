import * as THREE from "three";
import Component from "../World/Component";

/**
 * Component to add a BoxMesh to an object.
 */
export default class BoxMesh extends Component {
    initialize(_: number): void {
    }

    dispose(): void {}

    start(): void {
        const mesh = new THREE.Mesh()
        mesh.geometry = new THREE.BoxGeometry()
        mesh.material = new THREE.MeshStandardMaterial()
        
        this.game_object.add(mesh);
    }

    update(): void {}
}