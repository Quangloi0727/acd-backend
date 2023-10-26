import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, Tenant, TenantDocument } from '../schemas';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { LoggingService } from 'src/providers/logging';
import * as moment from 'moment';
import { ConversationState, KAFKA_TOPIC_MONITOR, NotifyEventType, ParticipantType } from 'src/common/enums';
import { NotifyNewMessageToAgentCommand } from 'src/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { KafkaClientService, KafkaService } from 'src/providers/kafka';
import { ChatSessionManagerService } from 'src/chat-session-manager';
import _ from 'underscore';

@Injectable()
export class ChatSessionTrackerService implements OnModuleInit, OnModuleDestroy {
    private readonly _refreshJobSetStatusOpen: CronJob;
    private readonly _refreshJobSetStatusClose: CronJob;
    private _running = false;
    constructor(
        @InjectModel(Conversation.name)
        private readonly conversationModal: Model<ConversationDocument>,
        @InjectModel(Tenant.name)
        private readonly tenantModal: Model<TenantDocument>,
        private readonly configService: ConfigService,
        private readonly loggingService: LoggingService,
        private readonly commandBus: CommandBus,
        @Inject(KafkaClientService)
        private kafkaService: KafkaService,
        private readonly chatSessionManagerService: ChatSessionManagerService,
    ) {
        const timeJobSetOpen = this.configService.get("JOB_SET_CONVERSATION_TO_OPEN") || '*/5 * * * *';
        const timeJobSetClose = this.configService.get("JOB_SET_CONVERSATION_TO_CLOSE") || '*/5 * * * *';
        this._refreshJobSetStatusOpen = new CronJob({
            cronTime: timeJobSetOpen,
            onTick: async () => {
                if (!this._running) {
                    this._running = true;
                    try {
                        await this.loggingService.debug(ChatSessionTrackerService, `Job set conversation to open running at ${moment(new Date()).format("DD/MM/YYYY HH:mm:ss")}`);
                        await this.findAndSetStateToOpenWithConversationOutOfSLA();
                    } catch (e) {
                        this.loggingService.error(ChatSessionTrackerService, `Job set conversation to open error: ${e?.message}`);
                    }
                    this._running = false;
                } else {
                    await this.loggingService.debug(ChatSessionTrackerService, `This job set open will be ignore until previous run finish!`);
                }
            },
            runOnInit: false,
            context: this,
        });
        this._refreshJobSetStatusClose = new CronJob({
            cronTime: timeJobSetClose,
            onTick: async () => {
                if (!this._running) {
                    this._running = true;
                    try {
                        await this.loggingService.debug(ChatSessionTrackerService, `Job set conversation to close running at ${moment(new Date()).format("DD/MM/YYYY HH:mm:ss")}`);
                        await this.closeConversationForConfigSetup();
                    } catch (e) {
                        this.loggingService.error(ChatSessionTrackerService, `Job set conversation to close error: ${e?.message}`);
                    }
                    this._running = false;
                } else {
                    await this.loggingService.debug(ChatSessionTrackerService, `This job set close will be ignore until previous run finish!`);
                }
            },
            runOnInit: false,
            context: this,
        });
    }

    onModuleInit() {
        this._refreshJobSetStatusOpen.start();
        this._refreshJobSetStatusClose.start();
    }

    onModuleDestroy() {
        this._refreshJobSetStatusOpen.stop();
        this._refreshJobSetStatusClose.stop();
    }

    async findAndSetStateToOpenWithConversationOutOfSLA() {
        const findConverSation = await this.conversationModal.find({ conversationState: ConversationState.INTERACTIVE, isReply: false }).exec();
        if (!findConverSation.length) {
            return this.loggingService.debug(ChatSessionTrackerService, `Not find conversation satisfy !`);
        } else {
            for (let cv of findConverSation) {
                const findConfigTenant = await this.tenantModal.findOne({ cloudTenantId: cv.cloudTenantId }).lean().exec();
                const timeSetUp = findConfigTenant['configs'][cv.applicationId].timeSetToOpen;
                if (!timeSetUp || timeSetUp == null) {
                    await this.loggingService.debug(ChatSessionTrackerService, `Conversation ${cv._id} of appId ${cv.applicationId} don't config SLA close !`);
                } else {
                    await this.loggingService.debug(ChatSessionTrackerService, `Conversation ${cv._id} of appId ${cv.applicationId} have config SLA is: ${timeSetUp} !`);
                    const timeCheck = moment(cv.lastTime).add(timeSetUp, 'minutes').valueOf();
                    if (timeCheck < moment(new Date()).valueOf()) {
                        await this.loggingService.debug(ChatSessionTrackerService, `UnPickUp conversationId ${cv._id}`);
                        const dataUpdate = await this.conversationModal.findByIdAndUpdate(cv._id, {
                            conversationState: ConversationState.OPEN,
                            agentPicked: null,
                            $pull: { participants: cv.agentPicked },
                            lastTime: new Date()
                        }, { new: true }).lean().exec();
                        await this.requestGetAgentOnline(dataUpdate._id, cv.agentPicked);
                    } else {
                        await this.loggingService.debug(ChatSessionTrackerService, `conversationId ${cv._id} haven't run out of SLA yet !`);
                    }
                }
            }
        }
    }

    private async requestGetAgentOnline(conversationId, agentPicked) {
        const findConverSation = await this.conversationModal.findById(conversationId).exec();
        const { _id, cloudTenantId, applicationId } = findConverSation;
        const responseAssign = await this.chatSessionManagerService.assignAgentToSession(_id, cloudTenantId, applicationId, null, agentPicked);
        // 2:not find assign to assign,14 not connect to grpc assignment or acd asm
        if (responseAssign.code == 2 || responseAssign.code == 14) {
            await this.loggingService.info(ChatSessionTrackerService, `Not find agent online to assign !`);
            const data: any = { ...findConverSation };
            data.event = NotifyEventType.UNASSIGN_CONVERSATION;
            data.room = [`${cloudTenantId}_${applicationId}`].join(',');
            data.conversationId = _id;
            await this.notifyAndSendToKafka(cloudTenantId, applicationId, data, KAFKA_TOPIC_MONITOR.CONVERSATION_UNASSIGN_BY_SYSTEM);
        } else {
            await this.loggingService.info(ChatSessionTrackerService, `Response assign agent is: ${responseAssign.agentId}`);
            findConverSation.conversationState = ConversationState.INTERACTIVE;
            findConverSation.agentPicked = responseAssign.agentId;
            findConverSation.save();
            const data: any = { ...findConverSation };
            data.event = NotifyEventType.UNASSIGN_CONVERSATION;
            data.room = [`${cloudTenantId}_${applicationId}`];
            data.conversationId = _id;
            await this.notifyAndSendToKafka(cloudTenantId, applicationId, data, KAFKA_TOPIC_MONITOR.CONVERSATION_ASSIGN_BY_SYSTEM);
        }
    }

    async closeConversationForConfigSetup() {
        const findTenant = await this.tenantModal.find({}).exec();
        if (!findTenant || !findTenant.length) return this.loggingService.info(ChatSessionTrackerService, "Don't have channel to update !");
        for (const appId of findTenant) {
            const asyncTasks = [];

            for (const property in appId.configs) {
                const timeClose = appId.configs[property].autoEndConversationTime;

                const task = async () => {
                    if (timeClose == null || !timeClose) {
                        await this.loggingService.debug(ChatSessionTrackerService, `AppId: ${property} run close conversation default with 24h !`);
                        await this.findConversationSatisfyAndClose(property, 1440);
                    } else {
                        await this.loggingService.debug(ChatSessionTrackerService, `AppId: ${property} have time to close conversation is: ${timeClose} !`);
                        await this.findConversationSatisfyAndClose(property, timeClose);
                    }
                };

                asyncTasks.push(task());
            }
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Promise.all timed out after 60 seconds'));
                }, 60000); // 60 seconds
            });

            try {
                await Promise.race([Promise.all(asyncTasks), timeoutPromise]);
            } catch (error) {
                await this.loggingService.error(ChatSessionTrackerService, `Run multiple task error: ${error.message}`);
            }
        }
    }

    async findConversationSatisfyAndClose(appId, timeClose) {
        const timeCompare = moment(new Date).subtract(timeClose, 'minutes');
        const listConversation = await this.conversationModal.find({ applicationId: appId, conversationState: ConversationState.INTERACTIVE, lastTime: { $lt: timeCompare } }).lean().exec();
        if (!listConversation || !listConversation.length) {
            await this.loggingService.debug(ChatSessionTrackerService, `Not find conversation interactive by appId ${appId}`);
        } else {
            try {
                const listIdUpdate = _.pluck(listConversation, '_id');
                await this.conversationModal.updateMany({ _id: { $in: listIdUpdate } }, {
                    conversationState: ConversationState.CLOSE,
                    closedTime: new Date()
                });
                const listData = await this.conversationModal.find({ _id: { $in: listIdUpdate } }).populate("lastMessage").lean().exec();
                for (const el of listData) {
                    const { cloudTenantId, applicationId } = el;
                    const rooms = [`${cloudTenantId}_${applicationId}`];
                    const data: any = { ...el };
                    data.event = NotifyEventType.CLOSE_CONVERSATION;
                    data.room = rooms.join(',');
                    data.conversationId = data._id;
                    await this.notifyAndSendToKafka(cloudTenantId, applicationId, data, KAFKA_TOPIC_MONITOR.CONVERSATION_CLOSE_BY_SYSTEM);
                }
            } catch (error) {
                await this.loggingService.error(ChatSessionTrackerService, `An error occurred ${error.message}`);
            }
        }
    }

    async notifyAndSendToKafka(cloudTenantId, applicationId, data, topic) {
        // notify to agent
        await this.commandBus.execute(
            new NotifyNewMessageToAgentCommand(
                ParticipantType.AGENT,
                NotifyEventType.ASSIGN_CONVERSATION,
                [`${cloudTenantId}_${applicationId}`].join(','),
                data
            )
        );
        // send kafka event assign conversation
        await this.kafkaService.send(data, topic);
    }
}
