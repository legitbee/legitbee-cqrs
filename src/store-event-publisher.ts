import {Injectable} from '@nestjs/common';
import {AggregateRoot, IEvent} from '@nestjs/cqrs';
import {StoreEventBus} from './store-event-bus';

export interface Constructor<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

@Injectable()
export class StoreEventPublisher<EventBase extends IEvent = IEvent> {
  constructor(private readonly eventBus: StoreEventBus<EventBase>) {}

  mergeClassContext<T extends Constructor<AggregateRoot<EventBase>>>(
    metatype: T
  ): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: EventBase) {
        eventBus.publish(event);
      }

      publishAll(events: EventBase[]) {
        eventBus.publishAll(events);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase) => {
      eventBus.publish(event);
    };

    object.publishAll = (events: EventBase[]) => {
      eventBus.publishAll(events);
    };
    return object;
  }
}
