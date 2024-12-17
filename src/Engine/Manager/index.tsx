import Engine from "Engine";

/**
 * A manager is a system responsible for handling specific resources in Three.JS.
 * Managers can access other managers through their reference to `engine`.
 * 
 * @see {@link Engine}
 */
export default abstract class Manager {
    /**
     * Readonly reference to the engine that the manager is a part of.
     */
    readonly engine: Engine;

    /**
     * The unique name of the manager to easily access it from the engine.
     */
    readonly name: string;

    constructor(engine: Engine) {
        this.engine = engine;
        this.name = this.get_name();
    }

    protected abstract get_name(): string; 
}