import * as React from 'react';
import * as go from 'gojs';
import { Diagram, ChangedEvent } from 'gojs';
import { DiagramModel, BaseNodeModel, LinkModel } from './model';
import { ModelChangeEvent } from './modelChangeEvent';
import {
    AddNodeModelChangedHandler,
    AddLinkModelChangedHandler,
    RemoveNodeModelChangedHandler,
    RemoveLinkModelChangedHandler,
    GroupNodeModelChangedHandler
} from './modelChangedhandler';

export interface GojsDiagramProps<N extends BaseNodeModel, L extends LinkModel> {
    model: DiagramModel<N, L>;
    createDiagram: (id: string) => Diagram;
    diagramId: string;
    className: string;
    onModelChange?: (event: ModelChangeEvent<N, L>) => void;
    linkFromPortIdProperty?: string;
    linkToPortIdProperty?: string;
    nodeCategoryProperty?: string;
    makeUniqueKeyFunction?: () => void;
}

export interface GojsModel extends go.Model {
    linkDataArray: Object[];
    addLinkDataCollection: (links: Object[]) => void;
    removeLinkDataCollection: (links: Object[]) => void;
    addLinkData: (link: Object) => void;
    removeLinkData: (link: Object) => void;
}

class GojsDiagram<N extends BaseNodeModel, L extends LinkModel> extends React.PureComponent<GojsDiagramProps<N, L>> {
    private myDiagram: Diagram;
    private modelChangedHandlers = [
        new AddNodeModelChangedHandler<N, L>(),
        new AddLinkModelChangedHandler<N, L>(),
        new RemoveNodeModelChangedHandler<N, L>(),
        new RemoveLinkModelChangedHandler<N, L>(),
        new GroupNodeModelChangedHandler<N, L>()
    ];

    constructor(props: GojsDiagramProps<N, L>) {
        super(props);
        this.modelChangedHandler = this.modelChangedHandler.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
        if (this.props.onModelChange) {
            this.myDiagram.removeModelChangedListener(this.modelChangedHandler);
        }
        this.myDiagram.clear();
    }

    componentDidUpdate() {
        this.myDiagram.startTransaction();
        this.applyAddRemoveLinksFromModel();
        this.applyAddRemoveNodesFromModel();
        this.applyUpdatesFromModel();
        this.myDiagram.updateAllRelationshipsFromData();
        this.myDiagram.updateAllTargetBindings();
        this.myDiagram.commitTransaction('updated');
    }
    init() {
        const { createDiagram, diagramId, onModelChange } = this.props;
        this.myDiagram = createDiagram(diagramId);
        if (onModelChange) {
            this.myDiagram.addModelChangedListener(this.modelChangedHandler);
        }

        this.myDiagram.model = go.GraphObject.make(go.GraphLinksModel, {
            ...(this.props.makeUniqueKeyFunction && {
                makeUniqueKeyFunction: this.props.makeUniqueKeyFunction
            }),
            linkFromPortIdProperty: this.props.linkFromPortIdProperty || '',
            linkToPortIdProperty: this.props.linkToPortIdProperty || '',
            nodeDataArray: [...this.props.model.nodeDataArray],
            linkDataArray: [...this.props.model.linkDataArray],
            nodeCategoryProperty: this.props.nodeCategoryProperty || 'category'
        });
    }
    render() {
        return <div id={this.props.diagramId} className={this.props.className} />;
    }

    private modelChangedHandler(evt: ChangedEvent) {
        this.modelChangedHandlers.forEach(handler => {
            if (handler.canHandle(evt)) {
                handler.handle(evt, this.props.model, this.props.onModelChange!);
            }
        });
    }

    private applyAddRemoveNodesFromModel() {
        const nodesToAdd = this.props.model.nodeDataArray
            .filter(e => this.myDiagram.model.nodeDataArray.findIndex((el: BaseNodeModel) => el.key === e.key) === -1)
            .map(node => Object.assign({}, node));
        this.myDiagram.model.addNodeDataCollection(nodesToAdd);
        const nodesToRemove = this.myDiagram.model.nodeDataArray.filter(
            (e: BaseNodeModel) => this.props.model.nodeDataArray.findIndex(el => el.key === e.key) === -1
        );
        this.myDiagram.model.removeNodeDataCollection(nodesToRemove);
    }

    private applyAddRemoveLinksFromModel() {
        const linksToAdd = this.props.model.linkDataArray
            .filter(
                e =>
                    (this.myDiagram.model as GojsModel).linkDataArray.findIndex(
                        (el: LinkModel) => el.from === e.from && el.to === e.to
                    ) === -1
            )
            .map(link => Object.assign({}, link));
        (this.myDiagram.model as GojsModel).addLinkDataCollection(linksToAdd);
        const linksToRemove = (this.myDiagram.model as GojsModel).linkDataArray.filter(
            (e: LinkModel) =>
                this.props.model.linkDataArray.findIndex(el => el.from === e.from && el.to === e.to) === -1
        );
        (this.myDiagram.model as GojsModel).removeLinkDataCollection(linksToRemove);
    }

    private applyUpdatesFromModel() {
        this.myDiagram.model.applyIncrementalJson({
            class: 'go.GraphLinksModel',
            incremental: 1,
            nodeKeyProperty: 'key',
            linkKeyProperty: 'key',
            linkFromPortIdProperty: this.props.linkFromPortIdProperty || '',
            linkToPortIdProperty: this.props.linkToPortIdProperty || '',
            modifiedNodeData: this.props.model.nodeDataArray,
            modifiedLinkData: this.props.model.linkDataArray
        });
    }
}

export default GojsDiagram;
