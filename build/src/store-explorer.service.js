"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreExplorerService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/cqrs/dist/decorators/constants");
let StoreExplorerService = class StoreExplorerService {
    constructor(modulesContainer) {
        this.modulesContainer = modulesContainer;
    }
    explore() {
        const modules = [...this.modulesContainer.values()];
        const commands = this.flatMap(modules, instance => this.filterProvider(instance, constants_1.COMMAND_HANDLER_METADATA));
        const queries = this.flatMap(modules, instance => this.filterProvider(instance, constants_1.QUERY_HANDLER_METADATA));
        const events = this.flatMap(modules, instance => this.filterProvider(instance, constants_1.EVENTS_HANDLER_METADATA));
        const sagas = this.flatMap(modules, instance => this.filterProvider(instance, constants_1.SAGA_METADATA));
        return { commands, queries, events, sagas };
    }
    flatMap(modules, callback) {
        const items = modules
            .map(module => [...module.providers.values()].map(callback))
            .reduce((a, b) => a.concat(b), []);
        return items.filter(element => !!element);
    }
    filterProvider(wrapper, metadataKey) {
        const { instance } = wrapper;
        if (!instance) {
            return undefined;
        }
        return this.extractMetadata(instance, metadataKey);
    }
    extractMetadata(instance, metadataKey) {
        if (!instance.constructor) {
            return;
        }
        const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
        return metadata ? instance.constructor : undefined;
    }
};
StoreExplorerService = __decorate([
    (0, common_1.Injectable)()
], StoreExplorerService);
exports.StoreExplorerService = StoreExplorerService;
//# sourceMappingURL=store-explorer.service.js.map