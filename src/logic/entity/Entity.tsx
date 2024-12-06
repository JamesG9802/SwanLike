import EventHandler from "utility/EventHandler";

/**
 * An entity is a creature that is able to be fought.
 */
export abstract class Entity {
    /**
     * Event for when the entity is damaged.
     */
    public readonly on_damage: EventHandler<Entity, void>;

    /**
     * Event for when the entity dies.
     */
    public readonly on_death: EventHandler<Entity, void>;

    /**
     * The current health of the entity.
     */
    public health: number;
    
    /**
     * The maximum health of the entity. The current health cannot exceed the maximum health.
     */
    public max_health: number;

    constructor(health: number, max_health: number) {
        this.on_damage = new EventHandler<Entity, void>(this);
        this.on_death = new EventHandler<Entity, void>(this);

        this.health = health;
        this.max_health = max_health;
    }

}