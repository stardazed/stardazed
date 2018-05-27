import { Instance, InstanceArrayView } from "./instance";
export declare type Entity = Instance<EntityManager>;
export declare type EntityArrayView = InstanceArrayView<EntityManager>;
export declare function entityGeneration(ent: Entity): number;
export declare function entityIndex(ent: Entity): number;
export declare class EntityManager {
    private generation_;
    private genCount_;
    private freedIndices_;
    private minFreedBuildup;
    constructor();
    private appendGeneration();
    create(): Entity;
    alive(ent: Entity): boolean;
    destroy(ent: Entity): void;
}
