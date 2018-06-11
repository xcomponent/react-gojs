import { BaseNodeModel, LinkModel, DiagramModel } from './model';

export enum ModelChangeEventType {
    Add = 'Add',
    Remove = 'Remove',
    Group = 'Group'
}
export interface ModelChangeEvent<N extends BaseNodeModel, L extends LinkModel> {
    eventType: ModelChangeEventType;
    nodeData?: N;
    linkData?: L;
    model: DiagramModel<N, L>;
}
