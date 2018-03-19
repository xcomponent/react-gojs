import * as React from 'react';
import * as go from 'gojs';
import { Diagram } from 'gojs';
import { DiagramModel, BaseNodeModel, LinkModel } from './model';

export interface GojsDiagramProps<N extends BaseNodeModel, L extends LinkModel> {
    model: DiagramModel<N, L>;
    createDiagram: (id: string) => Diagram;
    diagramId: string;
    className: string;

}

interface GojsModel extends go.Model {
    linkDataArray: Object[];
    addLinkDataCollection: (links: Object[]) => void;
    removeLinkDataCollection: (links: Object[]) => void;
}

class GojsDiagram<N extends BaseNodeModel, L extends LinkModel> extends React.PureComponent<GojsDiagramProps<N, L>> {

    private myDiagram: Diagram;

    constructor(props: GojsDiagramProps<N, L>) {
        super(props);
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
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
        const { createDiagram, diagramId } = this.props;
        this.myDiagram = createDiagram(diagramId);
        this.myDiagram.model = new go.GraphLinksModel(
            [...this.props.model.nodeDataArray],
            [...this.props.model.linkDataArray]);
    }
    render() {
        return (
            <div id={this.props.diagramId} className={this.props.className} />
        );
    }

    private applyAddRemoveNodesFromModel() {
        const nodesToAdd = this.props.model.nodeDataArray.filter(e =>
            this.myDiagram.model.nodeDataArray.findIndex((el: BaseNodeModel) => el.key === e.key) === -1)
            .map(node => Object.assign({}, node));
        this.myDiagram.model.addNodeDataCollection(nodesToAdd);
        const nodesToRemove = this.myDiagram.model.nodeDataArray.filter((e: BaseNodeModel) =>
            this.props.model.nodeDataArray.findIndex(el =>
                el.key === e.key) === -1);
        this.myDiagram.model.removeNodeDataCollection(nodesToRemove);
    }

    private applyAddRemoveLinksFromModel() {
        const linksToAdd = this.props.model.linkDataArray.filter(e =>
            (this.myDiagram.model as GojsModel).linkDataArray.findIndex((el: LinkModel) =>
                el.from === e.from && el.to === e.to) === -1)
            .map(link => Object.assign({}, link));
        (this.myDiagram.model as GojsModel).addLinkDataCollection(linksToAdd);
        const linksToRemove = (this.myDiagram.model as GojsModel).linkDataArray.filter((e: LinkModel) =>
            this.props.model.linkDataArray.findIndex(el =>
                el.from === e.from && el.to === e.to) === -1);
        (this.myDiagram.model as GojsModel).removeLinkDataCollection(linksToRemove);
    }

    private applyUpdatesFromModel() {
        this.myDiagram.model.applyIncrementalJson({
            class: 'go.GraphLinksModel',
            incremental: 1,
            nodeKeyProperty: 'key',
            linkKeyProperty: 'key',
            modifiedNodeData: this.props.model.nodeDataArray,
            modifiedLinkData: this.props.model.linkDataArray,
        });
    }
}

export default GojsDiagram;