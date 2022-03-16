import {DynamicModule, Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {StoreEventBus} from './store-event-bus';
import {StoreEventPublisher} from './store-event-publisher';
import {StoreExplorerService} from './store-explorer.service';
import * as mqtt from 'async-mqtt';
import {EventsModuleOptionsI} from './events.interface';
import {EventsModuleOptions, MqttClient} from './events.constant';

@Module({})
export class EventsModule {
  constructor(
    private readonly explorerService: StoreExplorerService,
    private readonly eventsBus: StoreEventBus
  ) {}

  onApplicationBootstrap() {
    const {events} = this.explorerService.explore();

    this.eventsBus.register(events);
  }

  static forRoot(options: EventsModuleOptionsI): DynamicModule {
    const mqttClient = mqtt.connect(options.mqtt.brokerUrl, options.mqtt.opts);

    return {
      module: EventsModule,
      imports: [CqrsModule],
      providers: [
        StoreExplorerService,
        StoreEventBus,
        StoreEventPublisher,
        {useValue: mqttClient, provide: MqttClient},
        {useValue: options, provide: EventsModuleOptions},
      ],
      exports: [StoreEventBus, StoreEventPublisher],
      global: true,
    };
  }
}
