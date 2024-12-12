import Component from "../World/Component";

/**
 * Component to move a component up and down.
 */
export default class UpDown extends Component {
    static name: string = "UpDown";

    time: number = 0;
    speed: number = 1;

    protected get_name(): string {
        return UpDown.name;
    }

    initialize(data?: number): void {
        if (data != undefined) {
            this.speed = data;
        }
    }
    dispose(): void { }

    start(): void { this.time = 0; }

    update(delta: number): void {
        this.game_object.position.y = Math.sin(this.speed * this.time);
        this.time += delta;
    }
}