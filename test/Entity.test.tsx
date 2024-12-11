import { describe, it, expect, vi, beforeEach } from "vitest";
import { Object3D } from "three";
import { EntityConfig } from "Engine/Config/EntityConfig";
import log from "loglevel";
import { Entity, parse_entities_from_config } from "Engine/World/Entity";
import Component from "Engine/World/Component";
import { ResourceManager } from "Engine/Managers/ResourceManager";
import { WorldManager } from "Engine/Managers/WorldManager";

import app_config_resource from "resources/config/application.config.json";
import file_config_resource from "resources/config/resource.config.json";
import { FileConfig } from "Engine/Config/FileResourceConfig";
import { ApplicationConfig } from "Engine/Config/AppConfig";

vi.mock("loglevel", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

class TestComponent extends Component {
    initialize(): void { }
    start(): void { }
    update(): void { }
    dispose(): void { }
}

describe("Entity", () => {
    let entity: Entity;
    const resource_manager: ResourceManager = undefined as unknown as ResourceManager;
    const world_manager: WorldManager = undefined as unknown as WorldManager;

    beforeEach(() => {
        entity = new Entity("TestEntity");
    });

    it("should extend Object3D", () => {
        expect(entity).toBeInstanceOf(Object3D);
        expect(entity.name).toBe("TestEntity");
    });

    it("should add components", () => {
        const mockComponent1 = new TestComponent(true, entity, resource_manager, world_manager);
        const mockComponent2 = new TestComponent(true, entity, resource_manager, world_manager);

        entity.add_components(mockComponent1, mockComponent2);

        expect(entity.components).toContain(mockComponent1);
        expect(entity.components).toContain(mockComponent2);
    });

    it("should call start on all components", () => {
        const mockComponent1 = new TestComponent(true, entity, resource_manager, world_manager);
        const mockComponent2 = new TestComponent(true, entity, resource_manager, world_manager);

        const component1_spy = vi.spyOn(mockComponent1, "start");
        const component2_spy = vi.spyOn(mockComponent2, "start");

        entity.add_components(mockComponent1, mockComponent2);

        entity.start();

        expect(component1_spy).toHaveBeenCalled();
        expect(component2_spy).toHaveBeenCalled();
    });

    it("should call update only on active components", () => {
        const activeComponent = new TestComponent(true, entity, resource_manager, world_manager);
        const inactiveComponent = new TestComponent(true, entity, resource_manager, world_manager);
        inactiveComponent.active = false;

        const active_spy = vi.spyOn(activeComponent, "update");
        const inactive_spy = vi.spyOn(inactiveComponent, "update");

        entity.add_components(activeComponent, inactiveComponent);

        entity.update(16);

        expect(active_spy).toHaveBeenCalledWith(16);
        expect(inactive_spy).not.toHaveBeenCalled();
    });

    it("should mark entity for destruction", () => {
        expect(entity.will_destroy()).toBe(false);

        entity.destroy();

        expect(entity.will_destroy()).toBe(true);
    });

    it("should dispose of components during cleanup", () => {
        const mockComponent1 = new TestComponent(true, entity, resource_manager, world_manager);
        const mockComponent2 = new TestComponent(true, entity, resource_manager, world_manager);

        const component1_spy = vi.spyOn(mockComponent1, "dispose");
        const component2_spy = vi.spyOn(mockComponent2, "dispose");

        entity.add_components(mockComponent1, mockComponent2);

        entity.cleanup();

        expect(component1_spy).toHaveBeenCalled();
        expect(component2_spy).toHaveBeenCalled();
    });
});

describe("parse_entities_from_config", async () => {
    const resource_manager: ResourceManager = new ResourceManager();
    await resource_manager.initialize(file_config_resource as FileConfig);

    const world_manager: WorldManager = new WorldManager((app_config_resource as ApplicationConfig).start_scene, resource_manager);
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

        const entity = await parse_entities_from_config(entityConfig, resource_manager, world_manager);

        expect(entity).toBeInstanceOf(Entity);
        expect(entity.name).toBe("Entity 1");
        expect(entity.components.length).toBe(2);
        expect(entity.components[0]).toBeInstanceOf(Component);
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

        const entity = await parse_entities_from_config(entityConfig, resource_manager, world_manager);

        expect(entity).toBeInstanceOf(Entity);
        expect(entity.components.length).toBe(1);
        expect(log.error).toHaveBeenCalledWith(mockError);
    });
});
