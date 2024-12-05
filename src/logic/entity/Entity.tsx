/**
 * The types of events for entities.
 */
enum EntityEventType {
    /**
     * When the entity has died.
     */
    Death = "ondeath",
}

/**
 * Callback for listening to entity events.
 */
type EntityCallback = () => void;

/**
 * An entity is a creature that is able to be fought.
 */
abstract class Entity {
    /**
     * All the event listeners the entity is tracking.
     */
    private events: Map<string, EntityCallback[]>;
    
    /**
     * The current health of the entity.
     */
    public health: number;
    
    /**
     * The maximum health of the entity. The current health cannot exceed the maximum health.
     */
    public max_health: number;

    constructor(health: number, max_health: number) {
        this.events = new Map();
        this.health = health;
        this.max_health = max_health;
    }

    /**
     * Registers an event listener for the entity.
     * @param event the event to listen for.
     * @param callback the callback that will be invoked.
     */
    on(event: string, callback: EntityCallback): void {
        if(!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)?.push(callback);
    }

    /**
     * Removes an event listener for the entity.
     * @param event the event to listen for.
     * @param callback the callback that will be invoked.
     */
    off(event: string, callback: EntityCallback): void {
        const callbacks = this.events.get(event);
        
        if(!callbacks) return;

        this.events.set(
            event,
            callbacks.filter((cb) => cb != callback)
        );
    }
}