import EventHandler from "Utility/EventHandler";

/**
 * An entity is a creature that is able to be fought.
 */
export abstract class Unit {
    /**
     * Event for when the entity is damaged.
     */
    public readonly on_damage: EventHandler<Unit, void>;

    /**
     * Event for when the entity dies.
     */
    public readonly on_death: EventHandler<Unit, void>;

    /**
     * The current health of the entity.
     */
    public health: number;
    
    /**
     * The maximum health of the entity. The current health cannot exceed the maximum health.
     */
    public max_health: number;

    /**
     * How far the entity can move.
     */
    public movement_speed: number;

    /**
     * Creates a new entity.
     * @param health the current health of the entity
     * @param max_health The maximum health of the entity.
     */
    constructor(health: number, max_health: number, movement_speed: number) {
        this.on_damage = new EventHandler<Unit, void>(this);
        this.on_death = new EventHandler<Unit, void>(this);

        this.health = health;
        this.max_health = max_health;
        this.movement_speed = movement_speed;
    }

}
