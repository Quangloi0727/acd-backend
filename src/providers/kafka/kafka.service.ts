import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  Consumer,
  Kafka,
  Producer,
  RecordMetadata,
  Admin,
  SeekEntry,
  TopicPartitionOffsetAndMetadata,
  Offsets,
  logLevel,
} from 'kafkajs';
import { Deserializer, Serializer } from '@nestjs/microservices';
import { KafkaResponseDeserializer } from './deserializer/kafka-response.deserializer';
import { KafkaRequestSerializer } from './serializer/kafka-request.serializer';
import {
  KafkaModuleOption,
  KafkaMessageSend,
  KafkaTransaction,
  KafkaResponse,
} from './interfaces';

import { SUBSCRIBER_MAP, SUBSCRIBER_OBJECT_MAP } from './kafka.decorator';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'stream';
import * as winston from 'winston';
import { winstonLoggerOptions } from '../logging/logging.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private admin: Admin;
  private deserializer: Deserializer;
  private serializer: Serializer;
  private autoConnect: boolean;
  private isProducerConnected = false;
  private options: KafkaModuleOption['options'];
  // private eventEmitter = new EventEmitter();
  // public ON_MESSAGE_RECEIVED_EVENT = 'onMessageReceived';

  protected topicOffsets: Map<
    string,
    (SeekEntry & { high: string; low: string })[]
  > = new Map();

  protected logger = winston.createLogger(winstonLoggerOptions);

  getLogLevel() {
    switch (process.env.KAFKA_LOG_LEVEL || 'info') {
      case 'error':
        return logLevel.ERROR;
      case 'warn':
        return logLevel.WARN;
      case 'info':
        return logLevel.INFO;
      case 'debug':
        return logLevel.DEBUG;
      default:
        return logLevel.NOTHING;
    }
  }
  WinstonLogCreator(logLevel) {
    const logger = winston.createLogger(winstonLoggerOptions);

    return ({ namespace, level, label, log }) => {
      const { message } = log;
      logger.log(process.env.KAFKA_LOG_LEVEL || 'info', message, {
        marker: KafkaService,
      });
    };
  }

  constructor(options: KafkaModuleOption['options']) {
    const {
      client,
      consumer: consumerConfig,
      producer: producerConfig,
    } = options;
    this.kafka = new Kafka({
      ...client,
      logLevel: this.getLogLevel(),
      logCreator: this.WinstonLogCreator,
    });

    const { groupId } = consumerConfig;
    const consumerOptions = Object.assign(
      {
        groupId: this.getGroupIdSuffix(groupId),
      },
      consumerConfig,
    );

    this.autoConnect = options.autoConnect ?? true;
    this.consumer = this.kafka.consumer(consumerOptions);
    this.producer = this.kafka.producer(producerConfig);
    this.admin = this.kafka.admin();

    this.consumer.on('consumer.disconnect', () => {
      this.logger.error('consumer.disconnect', {
        marker: KafkaService,
      });
    });
    this.consumer.on('consumer.stop', () => {
      this.logger.error('consumer.stop', {
        marker: KafkaService,
      });
    });
    this.consumer.on('consumer.crash', () => {
      this.logger.error('consumer.crash', {
        marker: KafkaService,
      });
    });

    this.producer.on('producer.connect', async () => {
      this.isProducerConnected = true;
    });

    this.producer.on('producer.disconnect', async () => {
      this.isProducerConnected = false;
    });

    this.initializeDeserializer(options);
    this.initializeSerializer(options);
    this.options = options;
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.getTopicOffsets();
    SUBSCRIBER_MAP.forEach((functionRef, topic) => {
      this.subscribe(topic);
    });
    this.bindAllTopicToConsumer();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Connect the kafka service.
   */
  async connect(): Promise<void> {
    if (!this.autoConnect) {
      return;
    }

    await this.producer.connect();
    await this.consumer.connect();
    await this.admin.connect();
  }

  /**
   * Disconnects the kafka service.
   */
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.admin.disconnect();
  }

  /**
   * Gets the high, low and partitions of a topic.
   */
  private async getTopicOffsets(): Promise<void> {
    const topics = SUBSCRIBER_MAP.keys();

    for await (const topic of topics) {
      try {
        const topicOffsets = await this.admin.fetchTopicOffsets(topic);
        this.topicOffsets.set(topic, topicOffsets);
      } catch (e) {
        this.logger.error(`Error fetching topic offset: ${topic}`, {
          marker: KafkaService,
        });
      }
    }
  }

  /**
   * Subscribes to the topics.
   *
   * @param topic
   */
  private async subscribe(topic: string): Promise<void> {
    await this.consumer.subscribe({
      topic,
      fromBeginning: this.options.consumeFromBeginning || false,
    });
  }

  /**
   * Send/produce a message to a topic.
   *
   * @param message
   */
  async send(data: any, topic: string, key = null): Promise<RecordMetadata[]> {
    const message = {
      topic: topic,
      messages: [
        {
          key: key,
          value: data,
          headers: {
            Destination: topic,
            CorrelationId: randomUUID(),
            SenderId: randomUUID(),
          },
        },
      ],
    };
    if (!this.producer || !this.isProducerConnected) {
      this.logger.error('There is no producer, unable to send message.', {
        marker: KafkaService,
      });
      return [];
    }

    const serializedPacket = await this.serializer.serialize(message);

    return await this.producer.send(serializedPacket);
  }

  // /**
  //  * Send/produce a message to a request topic and wait response from response topic.
  //  *
  //  * @param data
  //  * @param requestTopic
  //  * @param responseTopic
  //  */
  // async sendAsync(
  //   data: any,
  //   requestTopic: string,
  //   responseTopic = '',
  //   waitResponse = false,
  //   key?: string,
  // ): Promise<any> {
  //   return new Promise(async (resolve, reject) => {
  //     const correlationId = randomUUID();
  //     //create listenner, return when match id
  //     const listener = (kafkaResponse: KafkaResponse) => {
  //       if (
  //         kafkaResponse &&
  //         kafkaResponse.headers &&
  //         kafkaResponse.headers['Destination'] == responseTopic &&
  //         kafkaResponse.headers['CorrelationId'] == correlationId
  //       ) {
  //         clearTimeout(id);
  //         this.eventEmitter.removeListener(
  //           this.ON_MESSAGE_RECEIVED_EVENT,
  //           listener,
  //         );
  //         resolve(kafkaResponse.response);
  //       }
  //     };

  //     //timeout when no received data
  //     const id = setTimeout(() => {
  //       clearTimeout(id);
  //       const msg = `There is no response from topic ${responseTopic} after ${this.options.responseDefaultTimeout} ms.`;
  //       this.logger.error(msg, {
  //         marker: KafkaService,
  //       });
  //       this.eventEmitter.removeListener(
  //         this.ON_MESSAGE_RECEIVED_EVENT,
  //         listener,
  //       );
  //       reject(msg);
  //     }, this.options.responseDefaultTimeout);

  //     this.eventEmitter.on(this.ON_MESSAGE_RECEIVED_EVENT, listener);

  //     //send data
  //     await this.send({
  //       topic: requestTopic,
  //       messages: [
  //         {
  //           key: key,
  //           value: data,
  //           headers: {
  //             Destination: requestTopic,
  //             ReplyTo: responseTopic,
  //             CorrelationId: correlationId,
  //             SenderId: randomUUID(),
  //           },
  //         },
  //       ],
  //     });

  //     if (!waitResponse) {
  //       clearTimeout(id);
  //       this.eventEmitter.removeListener(
  //         this.ON_MESSAGE_RECEIVED_EVENT,
  //         listener,
  //       );
  //       resolve(data);
  //     }
  //   });
  // }

  // /**
  //  * return response to response topic.
  //  *
  //  * @param data
  //  * @param headers
  //  */
  // async replyAsync(response: any, headers: any, key: string): Promise<void> {
  //   if (headers && headers['ReplyTo'])
  //     await this.send({
  //       topic: headers['ReplyTo'],
  //       messages: [
  //         {
  //           key: key,
  //           value: response,
  //           headers: {
  //             Destination: headers['ReplyTo'],
  //             CorrelationId: headers['CorrelationId'],
  //             SenderId: randomUUID(),
  //           },
  //         },
  //       ],
  //     });
  // }

  /**
   * Gets the groupId suffix for the consumer.
   *
   * @param groupId
   */
  public getGroupIdSuffix(groupId: string): string {
    return groupId + '-client';
  }

  /**
   * Calls the method you are subscribed to.
   *
   * @param topic
   *  The topic to subscribe to.
   * @param instance
   *  The class instance.
   */
  subscribeToResponseOf<T>(topic: string, instance: T): void {
    SUBSCRIBER_OBJECT_MAP.set(topic, instance);
  }

  /**
   * Returns a new producer transaction in order to produce messages and commit offsets together
   */
  async transaction(): Promise<KafkaTransaction> {
    const producer = this.producer;
    if (!producer) {
      const msg = 'There is no producer, unable to start transactions.';
      this.logger.error(msg, {
        marker: KafkaService,
      });
      throw msg;
    }

    const tx = await producer.transaction();
    const retval: KafkaTransaction = {
      abort(): Promise<void> {
        return tx.abort();
      },
      commit(): Promise<void> {
        return tx.commit();
      },
      isActive(): boolean {
        return tx.isActive();
      },
      async send(message: KafkaMessageSend): Promise<RecordMetadata[]> {
        const serializedPacket = await this.serializer.serialize(message);
        return await tx.send(serializedPacket);
      },
      sendOffsets(
        offsets: Offsets & { consumerGroupId: string },
      ): Promise<void> {
        return tx.sendOffsets(offsets);
      },
    };
    return retval;
  }

  /**
   * Commit consumer offsets manually.
   * Please note that in most cases you will want to use the given __autoCommitThreshold__
   * or use a transaction to atomically set offsets and outgoing messages.
   *
   * @param topicPartitions
   */
  async commitOffsets(
    topicPartitions: Array<TopicPartitionOffsetAndMetadata>,
  ): Promise<void> {
    return this.consumer.commitOffsets(topicPartitions);
  }

  /**
   * Sets up the serializer to encode outgoing messages.
   *
   * @param options
   */
  protected initializeSerializer(options: KafkaModuleOption['options']): void {
    this.serializer =
      (options && options.serializer) || new KafkaRequestSerializer();
  }

  /**
   * Sets up the deserializer to decode incoming messages.
   *
   * @param options
   */
  protected initializeDeserializer(
    options: KafkaModuleOption['options'],
  ): void {
    this.deserializer =
      (options && options.deserializer) || new KafkaResponseDeserializer();
  }

  /**
   * Runs the consumer and calls the consumers when a message arrives.
   */
  private bindAllTopicToConsumer(): void {
    const runConfig = this.options.consumerRunConfig
      ? this.options.consumerRunConfig
      : {};
    this.consumer.run({
      ...runConfig,
      eachMessage: async ({ topic, partition, message }) => {
        const objectRef = SUBSCRIBER_OBJECT_MAP.get(topic);
        const callback = SUBSCRIBER_MAP.get(topic);

        try {
          const { timestamp, response, offset, key, headers } =
            await this.deserializer.deserialize(message, { topic });
          await callback?.apply(objectRef, [
            response,
            key,
            offset,
            timestamp,
            partition,
            headers,
          ]);
          // this.eventEmitter.emit(this.ON_MESSAGE_RECEIVED_EVENT, {
          //   response: response,
          //   key: key,
          //   timestamp: timestamp,
          //   offset: offset,
          //   headers: headers,
          // });
        } catch (e) {
          this.logger.error(`Error for message ${topic}: ${e}`, {
            marker: KafkaService,
          });

          // Log and throw to ensure we don't keep processing the messages when there is an error.
          throw e;
        }
      },
    });

    if (this.options.seek !== undefined) {
      this.seekTopics();
    }
  }

  /**
   * Seeks to a specific offset defined in the config
   * or to the lowest value and across all partitions.
   */
  private seekTopics(): void {
    Object.keys(this.options.seek).forEach((topic) => {
      const topicOffsets = this.topicOffsets.get(topic);
      const seekPoint = this.options.seek[topic];

      topicOffsets.forEach((topicOffset) => {
        let seek = String(seekPoint);

        // Seek by timestamp
        if (typeof seekPoint == 'object') {
          const time = seekPoint;
          seek = time.getTime().toString();
        }

        // Seek to the earliest timestamp.
        if (seekPoint === 'earliest') {
          seek = topicOffset.low;
        }

        this.consumer.seek({
          topic,
          partition: topicOffset.partition,
          offset: seek,
        });
      });
    });
  }
}
