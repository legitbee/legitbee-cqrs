# Legitbee-CQRS

Legitbee-cqrs is a typescript nodejs library that re-implement the @nestjs/cqrs event bus to use MQTT.

## Installation

Use the package manager to install legitbee-cqrs.

```bash
npm install legitbee/legitbee-cqrs
```

## Usage

Add the module import in your `app.module.ts`:

```typescript
import {EventsModule} from 'legitbee-cqrs';

@Module({
  imports: [
    EventsModule.forRoot({
      mqtt: {
        brokerUrl: 'mqtt://test.mosquitto.org',
        opts: options, // show https://www.npmjs.com/package/mqtt#client
      },
      node: 'auth-api',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> The `node` parameter is used to subscribe to a shared mqtt subscription. Each instance of a running application with the same node parameter (`auth-api`) is loadbalanced behind each subscription.

And add the StoreEventBus in your command handler:

```typescript
@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    private ebus: StoreEventBus,
    @InjectRepository(AccountEntity)
    private repository: Repository<AccountEntity>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async execute(command: CreateAccountCommand) {
    const accountEntity = await this.repository.findOne(command.accountId);

    if (accountEntity !== undefined) {
      throw new ConflictException('accountId already exist');
    }

    // Check reservation unique id
    if (await this.redis.get(command.accountId)) {
      throw new ConflictException('accountId already exist');
    }

    // Do reservation (to be deleted in account-created-event)
    await this.redis.set(command.accountId, '');

    // Send event with mqtt
    this.ebus.publish(
      new AccountCreatedEvent(command.accountId, command.amount)
    );
  }
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
