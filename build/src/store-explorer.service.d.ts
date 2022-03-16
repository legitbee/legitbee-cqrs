import { Type } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { IEvent } from '@nestjs/cqrs/dist/interfaces';
import { CqrsOptions } from '@nestjs/cqrs/dist/interfaces/cqrs-options.interface';
export declare class StoreExplorerService<EventBase extends IEvent = IEvent> {
    private readonly modulesContainer;
    constructor(modulesContainer: ModulesContainer);
    explore(): CqrsOptions;
    flatMap<T>(modules: Module[], callback: (instance: InstanceWrapper) => Type<any> | undefined): Type<T>[];
    filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<unknown> | undefined;
    extractMetadata(instance: Record<string, unknown>, metadataKey: string): Type<unknown> | undefined;
}
