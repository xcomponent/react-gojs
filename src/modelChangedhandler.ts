import { ChangedEvent } from 'gojs';
import { BaseNodeModel, LinkModel, DiagramModel } from '.';
import { ModelChangeEvent, ModelChangeEventType } from './modelChangeEvent';
import { GojsModel } from './GojsDiagram';

export interface ModelChangedHandler<N extends BaseNodeModel, L extends LinkModel> {
    canHandle: (evt: ChangedEvent) => boolean;
    handle: (
        evt: ChangedEvent,
        model: DiagramModel<N, L>,
        onModelChange: (event: ModelChangeEvent<N, L>) => void
    ) => void;
}

const nodePropertyName = 'nodeDataArray';
const linkPropertyName = 'linkDataArray';

export class AddNodeModelChangedHandler<N extends BaseNodeModel, L extends LinkModel>
    implements ModelChangedHandler<N, L> {
    canHandle(evt: ChangedEvent): boolean {
        return evt.change === ChangedEvent.Insert && evt.propertyName === nodePropertyName;
    }

    handle(evt: ChangedEvent, model: DiagramModel<N, L>, onModelChange: (event: ModelChangeEvent<N, L>) => void) {
        if (!model.nodeDataArray.some((el: BaseNodeModel) => el.key === evt.newValue.key)) {
            onModelChange!({
                eventType: ModelChangeEventType.Add,
                nodeData: { ...evt.newValue },
                model: getNewModel(evt)
            });
        }
    }
}

export class AddLinkModelChangedHandler<N extends BaseNodeModel, L extends LinkModel>
    implements ModelChangedHandler<N, L> {
    canHandle(evt: ChangedEvent): boolean {
        return evt.change === ChangedEvent.Insert && evt.propertyName === linkPropertyName;
    }

    handle(evt: ChangedEvent, model: DiagramModel<N, L>, onModelChange: (event: ModelChangeEvent<N, L>) => void) {
        if (!model.linkDataArray.some((el: LinkModel) => el.from === evt.newValue.from && el.to === evt.newValue.to)) {
            onModelChange!({
                eventType: ModelChangeEventType.Add,
                linkData: { ...evt.newValue },
                model: getNewModel(evt)
            });
        }
    }
}

export class RemoveNodeModelChangedHandler<N extends BaseNodeModel, L extends LinkModel>
    implements ModelChangedHandler<N, L> {
    canHandle(evt: ChangedEvent): boolean {
        return evt.change === ChangedEvent.Remove && evt.propertyName === nodePropertyName;
    }

    handle(evt: ChangedEvent, model: DiagramModel<N, L>, onModelChange: (event: ModelChangeEvent<N, L>) => void) {
        if (model.nodeDataArray.some((el: BaseNodeModel) => el.key === evt.oldValue.key)) {
            onModelChange!({
                eventType: ModelChangeEventType.Remove,
                nodeData: { ...evt.oldValue },
                model: getNewModel(evt)
            });
        }
    }
}

export class RemoveLinkModelChangedHandler<N extends BaseNodeModel, L extends LinkModel>
    implements ModelChangedHandler<N, L> {
    canHandle(evt: ChangedEvent): boolean {
        return evt.change === ChangedEvent.Remove && evt.propertyName === linkPropertyName;
    }

    handle(evt: ChangedEvent, model: DiagramModel<N, L>, onModelChange: (event: ModelChangeEvent<N, L>) => void) {
        if (model.linkDataArray.some((el: LinkModel) => el.from === evt.oldValue.from && el.to === evt.oldValue.to)) {
            onModelChange!({
                eventType: ModelChangeEventType.Remove,
                linkData: { ...evt.oldValue },
                model: getNewModel(evt)
            });
        }
    }
}

export class GroupNodeModelChangedHandler<N extends BaseNodeModel, L extends LinkModel>
    implements ModelChangedHandler<N, L> {
    canHandle(evt: ChangedEvent): boolean {
        return evt.modelChange === 'nodeGroupKey' || evt.modelChange === 'nodeParentKey';
    }

    handle(evt: ChangedEvent, model: DiagramModel<N, L>, onModelChange: (event: ModelChangeEvent<N, L>) => void) {
        onModelChange!({
            eventType: ModelChangeEventType.Group,
            nodeData: { ...evt.object },
            model: getNewModel(evt)
        });
    }
}

const getNewModel = <N extends BaseNodeModel, L extends LinkModel>(changedEvent: ChangedEvent) => {
    return {
        nodeDataArray: [...changedEvent.model.nodeDataArray],
        linkDataArray: [...(changedEvent.model as GojsModel).linkDataArray]
    } as DiagramModel<N, L>;
};
