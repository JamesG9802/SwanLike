import log from "loglevel";

import Component from "../World/Component";

/**
 * Component to move a component up and down.
 */
export default class UpDown extends Component {
    time: number = 0;

    initialize(): void {
        log.info("Updown init");
    }
    dispose(): void {
    }



    start(): void {
        log.info("Updown start");
        this.time = 0;
    }

    update(delta: number): void {
        this.game_object.position.y = Math.sin(this.time);
        this.time += delta;
    }
}