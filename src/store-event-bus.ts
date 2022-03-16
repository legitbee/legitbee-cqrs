import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {CommandBus, EventHandlerType, ObservableBus} from '@nestjs/cqrs';
import {IEvent, IEventBus, IEventHandler} from '@nestjs/cqrs/dist/interfaces';
import {EVENTS_HANDLER_METADATA} from '@nestjs/cqrs/dist/decorators/constants';
import {defaultGetEventName} from '@nestjs/cqrs/dist/helpers/default-get-event-name';
import {filter} from 'rxjs';
import {EventsModuleOptions, MqttClient} from './events.constant';
import {AsyncMqttClient} from 'async-mqtt';
import {EventsModuleOptionsI, StoredEventI} from './events.interface';
import * as uuid from 'uuid';

@Injectable()
export class StoreEventBus<EventBase extends IEvent = IEvent>
  extends ObservableBus<EventBase>
  implements IEventBus<EventBase>, OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger('StoreEventBus');
  private subscriptions: Map<string, IEventHandler<EventBase>>;
  private instanceName: string;
  protected getEventName: (event: EventBase) => string;

  constructor(
    private readonly commandBus: CommandBus,
    @Inject(MqttClient) private readonly mqttClient: AsyncMqttClient,
    @Inject(EventsModuleOptions)
    private readonly eventModuleOptions: EventsModuleOptionsI,
    private readonly moduleRef: ModuleRef
  ) {
    super();
    this.subscriptions = new Map();
    this.instanceName = uuid.v4();
    this.getEventName = defaultGetEventName;
  }

  onModuleInit() {
    this.logger.log(`MQTT status: ${this.mqttClient.connected ? 'on' : 'off'}`);

    this.mqttClient.on('message', (_, payload) => {
      const event: StoredEventI = JSON.parse(payload.toString());

      const handler = this.subscriptions.get(event.event_type);

      if (handler) {
        handler.handle(event.payload as EventBase);
      } else {
        this.logger.warn(`receiving event with no handler ${event.event_type}`);
      }
    });

    this.mqttClient.on('disconnect', () => {
      this.logger.error('MQTT disconected');
    });

    this.mqttClient.on('reconnect', () => {
      this.logger.log('MQTT reconnected');
    });
  }

  publish<T extends EventBase>(event: T): void {
    const eventName = this.getEventName(event);

    const storedEvent: StoredEventI = {
      timestamp: new Date(),
      node: this.eventModuleOptions.node,
      instance: this.instanceName,
      event_type: eventName,
      payload: event,
    };

    this.mqttClient.publish(`events/${eventName}`, JSON.stringify(storedEvent));
  }

  publishAll(events: EventBase[]): void {
    (events || []).forEach(event => this.publish(event));
  }

  bind(handler: IEventHandler<EventBase>, name: string) {
    this.mqttClient.subscribe(
      `$share/${this.eventModuleOptions.node}/events/${name}`
    );
    this.subscriptions.set(name, handler);
  }

  onModuleDestroy() {
    this.subscriptions.forEach((_, subscription) => {
      this.mqttClient.unsubscribe(`events/${subscription}`);
    });
  }

  register(handlers: EventHandlerType<EventBase>[] = []) {
    this.logger.log('REGISTER handlers..');
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType<EventBase>) {
    const instance = this.moduleRef.get(handler, {strict: false});
    if (!instance) {
      return;
    }
    const eventsNames = this.reflectEventsNames(handler);
    eventsNames.forEach(event => this.bind(instance, event.name));
  }

  private reflectEventsNames(
    handler: EventHandlerType<EventBase>
  ): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  protected ofEventName(name: string) {
    return this.subject$.pipe(
      filter(event => this.getEventName(event) === name)
    );
  }
}
