import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandBus, EventHandlerType, ObservableBus } from '@nestjs/cqrs';
import { IEvent, IEventBus, IEventHandler } from '@nestjs/cqrs/dist/interfaces';
import { AsyncMqttClient } from 'async-mqtt';
import { EventsModuleOptionsI } from './events.interface';
export declare class StoreEventBus<EventBase extends IEvent = IEvent> extends ObservableBus<EventBase> implements IEventBus<EventBase>, OnModuleDestroy, OnModuleInit {
    private readonly commandBus;
    private readonly mqttClient;
    private readonly eventModuleOptions;
    private readonly moduleRef;
    private readonly logger;
    private subscriptions;
    private instanceName;
    protected getEventName: (event: EventBase) => string;
    constructor(commandBus: CommandBus, mqttClient: AsyncMqttClient, eventModuleOptions: EventsModuleOptionsI, moduleRef: ModuleRef);
    onModuleInit(): void;
    publish<T extends EventBase>(event: T): void;
    publishAll(events: EventBase[]): void;
    bind(handler: IEventHandler<EventBase>, name: string): void;
    onModuleDestroy(): void;
    register(handlers?: EventHandlerType<EventBase>[]): void;
    protected registerHandler(handler: EventHandlerType<EventBase>): void;
    private reflectEventsNames;
    protected ofEventName(name: string): import("rxjs").Observable<EventBase>;
}
