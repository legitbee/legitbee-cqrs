"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreEventPublisher = void 0;
const common_1 = require("@nestjs/common");
let StoreEventPublisher = class StoreEventPublisher {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    mergeClassContext(metatype) {
        const eventBus = this.eventBus;
        return class extends metatype {
            publish(event) {
                eventBus.publish(event);
            }
            publishAll(events) {
                eventBus.publishAll(events);
            }
        };
    }
    mergeObjectContext(object) {
        const eventBus = this.eventBus;
        object.publish = (event) => {
            eventBus.publish(event);
        };
        object.publishAll = (events) => {
            eventBus.publishAll(events);
        };
        return object;
    }
};
StoreEventPublisher = __decorate([
    (0, common_1.Injectable)()
], StoreEventPublisher);
exports.StoreEventPublisher = StoreEventPublisher;
//# sourceMappingURL=store-event-publisher.js.map