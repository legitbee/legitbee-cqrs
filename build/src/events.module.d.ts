import { DynamicModule } from '@nestjs/common';
import { StoreEventBus } from './store-event-bus';
import { StoreExplorerService } from './store-explorer.service';
import { EventsModuleOptionsI } from './events.interface';
export declare class EventsModule {
    private readonly explorerService;
    private readonly eventsBus;
    constructor(explorerService: StoreExplorerService, eventsBus: StoreEventBus);
    onApplicationBootstrap(): void;
    static forRoot(options: EventsModuleOptionsI): DynamicModule;
}
