import { describe, it, expect, vi, beforeEach } from "vitest";
import { Object3D } from "three";
import { EntityConfig } from "Engine/Config/EntityConfig";
import log from "loglevel";
import { Entity, parse_entities_from_config } from "Engine/World/Entity";
import Component from "Engine/World/Component";
import { ResourceManager } from "Engine/Manager/ResourceManager";
import { WorldManager } from "Engine/Manager/WorldManager";

import app_config_resource from "Resources/Config/application.config.json";
import file_config_resource from "Resources/Config/resource.config.json";
import { FileConfig } from "Engine/Config/FileResourceConfig";
import { ApplicationConfig } from "Engine/Config/AppConfig";
import { InputManager } from "Engine/Manager/InputManager";
import Engine from "Engine";

vi.mock("loglevel", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn()
    },
}));

class TestComponent extends Component {
    get_name(): string { return "TestComponent"; }
    initialize(): void { }
    start(): void { }
    update(): void { }
    dispose(): void { }
}

describe("Entity", () => {
    let entity: Entity;

    const engine: Engine = new Engine();
    const resource_manager: ResourceManager = {name: ResourceManager.name} as unknown as ResourceManager;
    const input_manager: InputManager = {name: ResourceManager.name} as unknown as InputManager;
    const world_manager: WorldManager = {name: ResourceManager.name} as unknown as WorldManager;

    engine.add_managers(resource_manager, input_manager, world_manager);

    beforeEach(() => {
        entity = new Entity("TestEntity");
    });

    it("should extend Object3D", () => {
        expect(entity).toBeInstanceOf(Object3D);
        expect(entity.name).toBe("TestEntity");
    });

    it("should add components to future", () => {
        entity.start();
        const mockComponent1 = new TestComponent(true, entity, engine);
        const start_spy = vi.spyOn(mockComponent1, "start");
        entity.add_components(mockComponent1);
        expect(entity.get_components().get("TestComponent")).toBe(mockComponent1);
        expect(start_spy).not.toHaveBeenCalled();
    });

    it("should add components to current", () => {
        const mockComponent1 = new TestComponent(true, entity, engine);
        const start_spy = vi.spyOn(mockComponent1, "start");
        const update_spy = vi.spyOn(mockComponent1, "update");
        entity.add_components(mockComponent1);
        entity.start();
        entity.update(1);
        expect(entity.get_components().get("TestComponent")).toBe(mockComponent1);
        expect(start_spy).toHaveBeenCalled();
        expect(update_spy).toHaveBeenCalled();
    });

    it("should not add duplicate components ", () => {
        const component_1 = new TestComponent(true, entity, engine);
        const component_2 = new TestComponent(false, entity, engine);
        entity.add_components(component_1, component_2);

        expect(log.warn).toHaveBeenCalledWith(`Entity ${entity.name} already has ${component_1.name}.`);

        expect(entity.get_components().get("TestComponent")).toBe(component_1);
        expect(entity.get_components().size).toBe(1);
    });

    it("should call start on all components", () => {
        const mockComponent1 = new TestComponent(true, entity, engine);

        const component1_spy = vi.spyOn(mockComponent1, "start");

        entity.add_components(mockComponent1);

        entity.start();

        expect(component1_spy).toHaveBeenCalled();
    });

    it("should call update only on active components", () => {
        const inactiveComponent = new TestComponent(true, entity, engine);
        inactiveComponent.active = false;

        const inactive_spy = vi.spyOn(inactiveComponent, "update");

        entity.add_components(inactiveComponent);

        entity.update(16);

        expect(inactive_spy).not.toHaveBeenCalled();
    });

    it("should mark entity for destruction", () => {
        expect(entity.will_destroy()).toBe(false);

        entity.destroy();

        expect(entity.will_destroy()).toBe(true);
    });

    it("should query entity for components", () => {
        const testComponent = new TestComponent(true, entity, engine);
        entity.add_components(testComponent);

        expect(entity.get_components().get("TestComponent")).toBeDefined();
    });

    it("should dispose of components during cleanup", () => {
        const mockComponent1 = new TestComponent(true, entity, engine);

        const component1_spy = vi.spyOn(mockComponent1, "dispose");

        entity.add_components(mockComponent1);

        entity.dispose();

        expect(component1_spy).toHaveBeenCalled();
    });
    
    it("should dispose of components that are marked for destruction", () => {
        const mockComponent1 = new TestComponent(true, entity, engine);

        const component1_spy = vi.spyOn(mockComponent1, "dispose");

        entity.add_components(mockComponent1);
        
        mockComponent1.destroy();

        entity.update(16);
        entity.dispose();

        expect(component1_spy).toHaveBeenCalled();
    });

    it("should remove components by marking them for destruction", () => {
        const mockComponent1 = new TestComponent(true, entity, engine);

        const component1_spy = vi.spyOn(mockComponent1, "destroy");

        entity.add_components(mockComponent1);

        entity.start();
        
        entity.remove_components(mockComponent1.name);

        entity.update(0);

        expect(component1_spy).toHaveBeenCalled();
    });

    
    it("should not update newly added components when marked for destruction", () => {
        entity.start();

        const mockComponent1 = new TestComponent(true, entity, engine);

        const start_spy = vi.spyOn(mockComponent1, "start");
        const destroy_spy = vi.spyOn(mockComponent1, "destroy");

        entity.add_components(mockComponent1);
        
        entity.remove_components(mockComponent1.name);

        entity.update(0);
        
        expect(start_spy).not.toHaveBeenCalled();
        expect(destroy_spy).toHaveBeenCalled();
    });
});

describe("parse_entities_from_config", async () => {
    const engine: Engine = new Engine();

    const resource_manager: ResourceManager = new ResourceManager(engine);
    await resource_manager.initialize(file_config_resource as FileConfig);
    engine.add_managers(resource_manager);


    const input_manager: InputManager = new InputManager(engine);
    engine.add_managers(input_manager);

    const world_manager: WorldManager = new WorldManager(
        engine 
    );
    engine.add_managers(world_manager);

    await world_manager.change_scene((app_config_resource as ApplicationConfig).start_scene);

    it("should parse an entity from a config", async () => {
        const entityConfig: EntityConfig = {
            "components": [
                {
                    "uuid": "1efb71b9-2d64-6290-966b-64cc6c6c9778",
                    "active": true,
                    "data": {
                    }
                },
                {
                    "uuid": "1efb73dc-a4a4-6dd0-afc1-84a58ed78a9f",
                    "active": true,
                    "data": {
                    }
                }
            ],
            "name": "Entity 1",
            "position": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
        };

        const entity = await parse_entities_from_config(entityConfig, engine);

        expect(entity).toBeInstanceOf(Entity);
        expect(entity.name).toBe("Entity 1");
        expect(entity.get_components().size).toBe(2);
    });

    it("should log an error if a component fails to load", async () => {
        const entityConfig: EntityConfig = {
            "components": [
                {
                    "uuid": "fake uid",
                    "active": true,
                    "data": {
                    }
                },
                {
                    "uuid": "1efb73dc-a4a4-6dd0-afc1-84a58ed78a9f",
                    "active": true,
                    "data": {
                    }
                }
            ],
            "name": "Entity 1",
            "position": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
        };

        const mockError = "Component did not load.";

        const entity = await parse_entities_from_config(entityConfig, engine);

        expect(entity).toBeInstanceOf(Entity);
        expect(entity.get_components().size).toBe(1);
        expect(log.error).toHaveBeenCalledWith(mockError);
    });
});
