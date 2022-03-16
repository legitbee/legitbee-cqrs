"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreEventBus = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const constants_1 = require("@nestjs/cqrs/dist/decorators/constants");
const default_get_event_name_1 = require("@nestjs/cqrs/dist/helpers/default-get-event-name");
const rxjs_1 = require("rxjs");
const events_constant_1 = require("./events.constant");
const uuid = require("uuid");
let StoreEventBus = class StoreEventBus extends cqrs_1.ObservableBus {
    constructor(commandBus, mqttClient, eventModuleOptions, moduleRef) {
        super();
        this.commandBus = commandBus;
        this.mqttClient = mqttClient;
        this.eventModuleOptions = eventModuleOptions;
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger('StoreEventBus');
        this.subscriptions = new Map();
        this.instanceName = uuid.v4();
        this.getEventName = default_get_event_name_1.defaultGetEventName;
    }
    onModuleInit() {
        this.logger.log(`MQTT status: ${this.mqttClient.connected ? 'on' : 'off'}`);
        this.mqttClient.on('message', (_, payload) => {
            const event = JSON.parse(payload.toString());
            const handler = this.subscriptions.get(event.event_type);
            if (handler) {
                handler.handle(event.payload);
            }
            else {
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
    publish(event) {
        const eventName = this.getEventName(event);
        const storedEvent = {
            timestamp: new Date(),
            node: this.eventModuleOptions.node,
            instance: this.instanceName,
            event_type: eventName,
            payload: event,
        };
        this.mqttClient.publish(`events/${eventName}`, JSON.stringify(storedEvent));
    }
    publishAll(events) {
        (events || []).forEach(event => this.publish(event));
    }
    bind(handler, name) {
        this.mqttClient.subscribe(`$share/${this.eventModuleOptions.node}/events/${name}`);
        this.subscriptions.set(name, handler);
    }
    onModuleDestroy() {
        this.subscriptions.forEach((_, subscription) => {
            this.mqttClient.unsubscribe(`events/${subscription}`);
        });
    }
    register(handlers = []) {
        this.logger.log('REGISTER handlers..');
        handlers.forEach(handler => this.registerHandler(handler));
    }
    registerHandler(handler) {
        const instance = this.moduleRef.get(handler, { strict: false });
        if (!instance) {
            return;
        }
        const eventsNames = this.reflectEventsNames(handler);
        eventsNames.forEach(event => this.bind(instance, event.name));
    }
    reflectEventsNames(handler) {
        return Reflect.getMetadata(constants_1.EVENTS_HANDLER_METADATA, handler);
    }
    ofEventName(name) {
        return this.subject$.pipe((0, rxjs_1.filter)(event => this.getEventName(event) === name));
    }
};
StoreEventBus = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(events_constant_1.MqttClient)),
    __param(2, (0, common_1.Inject)(events_constant_1.EventsModuleOptions))
], StoreEventBus);
exports.StoreEventBus = StoreEventBus;
//# sourceMappingURL=store-event-bus.js.map