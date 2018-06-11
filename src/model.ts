export interface BaseNodeModel {
    key: string;
}

export interface LinkModel {
    from: string;
    to: string;
}

export interface DiagramModel<N extends BaseNodeModel, L extends LinkModel> {
    nodeDataArray: N[];
    linkDataArray: L[];
}
