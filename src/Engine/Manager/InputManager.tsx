import { Vector2 } from "three";
import Manager from ".";
import Engine from "Engine";

/**
 * An input manager keeps track of all possible input events (mouse position, button state, etc.).
 */
export class InputManager extends Manager{
    static name: string = "InputManager";

    /**
     * The size of the canvas that the mouse is on.
     */
    canvas_size: Vector2;

    /**
     * The mouse's actual position, relative to the canvas.
     */
    mouse_pos: Vector2;

    /**
     * The mouse's normalized device coordinates (NDC).
     */
    mouse_ndc: Vector2;

    /**
     * Initializes the input manager with the mouse placed at the top-left
     * and the canvas set to 1x1 px^2.
     */
    constructor(engine: Engine) {
        super(engine);
        this.canvas_size = new Vector2(1, 1);
        this.mouse_pos = new Vector2(0, 0);
        this.mouse_ndc = new Vector2(-1, -1);
    }

    protected get_name(): string {
        return InputManager.name;
    }

    /**
     * Updates the mouse position when it moves over the canvas.
     * @param event 
     */
    on_mouse_move(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const left = (event.target as HTMLDivElement).getBoundingClientRect().left;
        const right = (event.target as HTMLDivElement).getBoundingClientRect().right;
        const top = (event.target as HTMLDivElement).getBoundingClientRect().top;
        const bottom = (event.target as HTMLDivElement).getBoundingClientRect().bottom;

        this.mouse_pos.x = event.clientX - left;
        this.mouse_pos.y = event.clientY - top;
    
        this.mouse_ndc.x = this.mouse_pos.x / (right - left) * 2 - 1;
        this.mouse_ndc.y = this.mouse_pos.y / (bottom - top ) * -2 + 1;
    }
}