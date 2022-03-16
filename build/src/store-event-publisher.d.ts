import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { StoreEventBus } from './store-event-bus';
export interface Constructor<T> {
    new (...args: any[]): T;
}
export declare class StoreEventPublisher<EventBase extends IEvent = IEvent> {
    private readonly eventBus;
    constructor(eventBus: StoreEventBus<EventBase>);
    mergeClassContext<T extends Constructor<AggregateRoot<EventBase>>>(metatype: T): T;
    mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T;
}
