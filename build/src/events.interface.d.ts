import * as mqtt from 'async-mqtt';
import { IEvent } from '@nestjs/cqrs';
export interface EventsModuleOptionsI {
    mqtt: {
        brokerUrl: string;
        opts?: mqtt.IClientOptions;
    };
    node: string;
}
export interface StoredEventI {
    timestamp: Date;
    node: string;
    instance: string;
    event_type: string;
    payload: IEvent;
}
