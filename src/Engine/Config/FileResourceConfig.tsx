import Identifiable from "Utility/Identifiable.d";

/**
 * The types of resources.
 */
export enum FileResourceType {
    /**
     * Scenes are the containers for all entities currently executing.
     */
    scene = "scene",

    /**
     * Components are scripts that can be attached to entities.
     */
    component = "component"
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
