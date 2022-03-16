"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const store_event_bus_1 = require("./store-event-bus");
const store_event_publisher_1 = require("./store-event-publisher");
const store_explorer_service_1 = require("./store-explorer.service");
const mqtt = require("async-mqtt");
const events_constant_1 = require("./events.constant");
let EventsModule = EventsModule_1 = class EventsModule {
    constructor(explorerService, eventsBus) {
        this.explorerService = explorerService;
        this.eventsBus = eventsBus;
    }
    onApplicationBootstrap() {
        const { events } = this.explorerService.explore();
        this.eventsBus.register(events);
    }
    static forRoot(options) {
        const mqttClient = mqtt.connect(options.mqtt.brokerUrl, options.mqtt.opts);
        return {
            module: EventsModule_1,
            imports: [cqrs_1.CqrsModule],
            providers: [
                store_explorer_service_1.StoreExplorerService,
                store_event_bus_1.StoreEventBus,
                store_event_publisher_1.StoreEventPublisher,
                { useValue: mqttClient, provide: events_constant_1.MqttClient },
                { useValue: options, provide: events_constant_1.EventsModuleOptions },
            ],
            exports: [store_event_bus_1.StoreEventBus, store_event_publisher_1.StoreEventPublisher],
            global: true,
        };
    }
};
EventsModule = EventsModule_1 = __decorate([
    (0, common_1.Module)({})
], EventsModule);
exports.EventsModule = EventsModule;
//# sourceMappingURL=events.module.js.map