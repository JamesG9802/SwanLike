import log from "loglevel";

import Manager from "./Manager";

//  Suppress the warnings here because they are needed for typedoc to link the documentation.
//  @typescript-eslint/no-unused-vars
import { InputManager } from "./Manager/InputManager";
//  @typescript-eslint/no-unused-vars
import { ResourceManager } from "./Manager/ResourceManager";
//  @typescript-eslint/no-unused-vars
import { WorldManager } from "./Manager/WorldManager";

/**
 * The engine is responsible for keeping track of all the managers for Three JS.
 * 
 * @see {@link InputManager}
 * @see {@link ResourceManager}
 * @see {@link WorldManager}
 */
export default class Engine {
    /**
     * The dictionary of managers the engine has access to.
     * Trying to modify the dictionary will result in a compile-time error.
     */
    private readonly managers: Map<string, Manager>;

    constructor() {
        this.managers = new Map<string, Manager>();
    }

    /**
     * Adds managers to the engine. If a manager already exists, the manager won't be added and the existing manager
     * will not be overwritten.
     * @param managers - the list of managers.
     */
    add_managers(...managers: Manager[]) {
        for(let i = 0; i < managers.length; i++) {
            if(this.managers.has(managers[i].name)) {
                log.warn(`The manager id: ${managers[i].name} already exists.`);
            }
            else {
                this.managers.set(managers[i].name, managers[i]);
            }
        }
    }

    /**
     * Gets a manager by its unique name.
     * @param name the manager's unique name
     * @returns 
     */
    get_manager<TManager>(name: string): TManager | undefined {
        return this.managers.get(name) as TManager | undefined;
    }
}