import * as THREE from "three";
import Component from "../World/Component";

/**
 * Component to add a BoxMesh to an object.
 */
export default class BoxMesh extends Component {
    static name: string = "BoxMesh";

    mesh: THREE.Mesh | undefined

    protected get_name(): string {
        return BoxMesh.name;
    }

    initialize(): void { }

    dispose(): void { }

    start(): void {
        this.mesh = new THREE.Mesh()
        this.mesh.geometry = new THREE.BoxGeometry()
        this.mesh.material = new THREE.MeshStandardMaterial()
        
        this.game_object.add(this.mesh);
    }

    update(): void { }
}