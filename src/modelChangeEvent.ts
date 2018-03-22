import { BaseNodeModel, LinkModel } from './model';

export enum ModelChangeEventType {
    Add = 'Add',
    Remove = 'Remove'
}
export interface ModelChangeEvent<N extends BaseNodeModel, L extends LinkModel> {
    eventType: ModelChangeEventType;
    nodeData?: N;
    linkData?: L;
}
