import log from "loglevel";
import Identifiable from "Utility/Identifiable";

/**
 * The types of resources.
 */
export enum FileResourceType {
    /**
     * Scenes are the containers for all entities currently executing.
     */
    scene,

    /**
     * Components are scripts that can be attached to entities.
     */
    component
}

/**
 * A FileResource is an UUID tracked resource. 
 */
export type FileResource = {
    type: FileResourceType,
    file_path: string
} & Identifiable;


/**
 * The format of the File Config JSON.
 */
export type FileConfig = {
    /**
     * All the files the application uses.
     */
    files: FileResource[];
}

/**
 * A resource managed by the manager.
 */
type Resource = {
    /**
     * Whether the resource has ever been loaded.
     */
    loaded: boolean,

    /**
     * The type of the resource.
     */
    type: FileResourceType,

    /**
     * If `loaded` = false, this is the callback loader. If `loaded` = true, this is the actual data of the resource.
     */
    data: any
}

/**
 * A resource manager keeps track of UUID-marked resources and loads them dynamically at runtime.
 * Does not currently supported unloading of resources.
 */
export class ResourceManager {
    /**
     * A dictionary mapping UUIDs to the resource.
     */
    private resources: Map<string, Resource>;

    constructor() { 
        this.resources = new Map<string, Resource>();
    }

    /**
     * Asynchronously gets all resources the application needs.
     * @param file_config 
     */
    async initialize(file_config: FileConfig) {
        //  🥲 Vite can't handle dynamic local file paths.

        const scenes = await import.meta.glob("/src/Resources/scene/*.json");
        const scripts= await import.meta.glob("/src/Three/Components/*.tsx");

        const path_to_loader: Map<string, any> = new Map<string, any>();

        for(const path in scenes) {
            path_to_loader.set(path.toLowerCase(), scenes[path]);
        }
        for(const path in scripts) {
            path_to_loader.set(path.toLowerCase(), scripts[path]);
        }
        
        for(let i = 0; i < file_config.files.length; i++) {
            this.resources.set(file_config.files[i].uuid, {
                loaded: false,
                type: file_config.files[i].type,
                data: path_to_loader.get(file_config.files[i].file_path.toLowerCase())
            });
        }
        // for(let i = 0; i < file_config.files.length; i++) {
        //     this.resources.set(file_config.files[i].uuid, {
        //         loaded: false,
        //         type: file_config.files[i].type,
        //         data: await import.meta.glob(file_config.files[i].file_path) 
        //     });
        // }
    }

    /**
     * Returns true if the resource manager has a UUID. Does not check if the resource has been loaded.
     * @param uuid - the Universal Unique Identifier.
     * @returns 
     */
    has(uuid: string): boolean {
        return this.resources.has(uuid);
    }

    /**
     * Loads a resource. The resource needs to be fetched if it was never retrieved yet in the application's runtime.
     * @param uuid - the Universal Unique Identifier.
     * @returns a Promise containing the object or undefined if the operation failed.
     */
    async load<TObject>(uuid: string): Promise<TObject | undefined> {
        if(!this.resources.has(uuid)) {
            const error_message: string = `Couldn't load ${uuid}`;
            log.error(error_message);
            return;
        }

        if(!this.resources.get(uuid)!.loaded) {
            try {
                this.resources.get(uuid)!.data = await this.resources.get(uuid)!.data();
                this.resources.get(uuid)!.loaded = true;
                
            }
            catch (error) {
                log.error(error);
                log.error(`Couldn't import file data ${uuid}.`);
            }
        }

        return this.resources.get(uuid)!.data;
    }
}