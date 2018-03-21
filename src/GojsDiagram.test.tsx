import * as React from 'react';
import * as go from 'gojs';
import { Diagram } from 'gojs';
import { mount } from 'enzyme';
import GojsDiagram, { GojsModel } from './GojsDiagram';
import { ModelChangeEvent, ModelChangeEventType } from './modelChangeEvent';
import { LinkModel, BaseNodeModel } from './model';

describe('<GojsDiagram />', () => {

    const model = {
        nodeDataArray: [
            { key: 'Alpha', color: 'lightblue' },
            { key: 'Beta', color: 'orange' },
            { key: 'Gamma', color: 'lightgreen' },
            { key: 'Delta', color: 'pink' },
            { key: 'Omega', color: 'grey' }
        ],
        linkDataArray:
            [
                { from: 'Alpha', to: 'Beta' },
                { from: 'Alpha', to: 'Gamma' },
                { from: 'Beta', to: 'Delta' },
                { from: 'Gamma', to: 'Omega' }
            ]
    };

    const createDiagram = (diagramId: string): Diagram => {
        const $ = go.GraphObject.make;

        const myDiagram: Diagram = $(
            go.Diagram,
            diagramId,
            {
                initialContentAlignment: go.Spot.LeftCenter,
            });

        myDiagram.nodeTemplate =
            $(
                go.Node,
                'Auto',
                $(
                    go.Shape,
                    'RoundedRectangle',
                    { strokeWidth: 0 },
                    new go.Binding('fill', 'color')),
                $(
                    go.TextBlock,
                    { margin: 8 },
                    new go.Binding('text', 'key'))
            );

        return myDiagram;
    };

    const myDiagramId = 'myDiagramId';

    let diagram: Diagram;
    let wrapper;
    let modelChangeCallback;

    beforeEach(() => {
        const dom = document.body;
        modelChangeCallback = jest.fn();
        wrapper = mount(
            (
                <GojsDiagram
                    diagramId={myDiagramId}
                    model={model}
                    createDiagram={(id) => {
                        diagram = createDiagram(myDiagramId);
                        return diagram;
                    }
                    }
                    className="fakecss"
                    onModelChange={modelChangeCallback}
                />
            ),
            { attachTo: dom });
    });

    it('should render links and nodes in the diagram based on the model provided as prop', () => {
        checkIfDiagramRendersModel(model, diagram);
    });

    const testCases = [
        {
            updatedModel: {
                ...model,
                nodeDataArray: [
                    ...model.nodeDataArray,
                    { key: 'New', color: 'blue' }
                ]
            },
            description: 'adding a new node'
        },
        {
            updatedModel: {
                nodeDataArray: [
                    { key: 'Alpha', color: 'lightblue' },
                    { key: 'Beta', color: 'orange' },
                    { key: 'Gamma', color: 'lightgreen' },
                ],
                linkDataArray:
                    [
                        { from: 'Alpha', to: 'Beta' },
                        { from: 'Alpha', to: 'Gamma' }
                    ]
            },
            description: 'removing nodes and links'
        },
        {
            updatedModel: {
                ...model,
                linkDataArray:
                    [
                        ...model.linkDataArray,
                        { from: 'Alpha', to: 'Omega' }
                    ]
            },
            description: 'adding a new link'
        },
        {
            updatedModel: {
                ...model,
                nodeDataArray: [
                    { key: 'Alpha', color: 'lightblue' },
                    { key: 'Beta', color: 'blue' },
                    { key: 'Gamma', color: 'black' },
                    { key: 'Delta', color: 'pink' },
                    { key: 'Omega', color: 'red' }
                ]
            },
            description: 'updating node properties (color)'
        }
    ];

    testCases.forEach(test => {
        // tslint:disable-next-line:max-line-length
        it(`should update the render of the diagram (nodes and links) based on the new model provided as prop - case: ${test.description}`, () => {
            checkIfDiagramRendersModel(model, diagram);
            wrapper.setProps({ model: test.updatedModel });
            checkIfDiagramRendersModel(test.updatedModel, diagram);
        });
    });

    it('should clear the diagram (remove nodes and links) when the compnent unmounts', () => {
        checkIfDiagramRendersModel(model, diagram);
        wrapper.unmount();
        expect(diagram.nodes.count).toBe(0);
        expect(diagram.links.count).toBe(0);
    });

    it('should trigger a model changed event when a node is added', () => {
        checkIfDiagramRendersModel(model, diagram);

        const newNode = { key: 'newNode', color: 'blue' };
        diagram.startTransaction();
        diagram.model.addNodeData(newNode);
        diagram.commitTransaction();

        expect(modelChangeCallback.mock.calls.length).toBe(1);
        const changeEvent = modelChangeCallback.mock.calls[0][0];
        expect(changeEvent.eventType).toBe(ModelChangeEventType.Add);
        expect(changeEvent.nodeData.key).toBe(newNode.key);
        expect(changeEvent.nodeData.color).toBe(newNode.color);
        expect(changeEvent.linkData).toBeUndefined();
    });

    it('should trigger a model changed event when a link is added', () => {
        checkIfDiagramRendersModel(model, diagram);

        const newLink = { from: 'Alpha', to: 'Omega' };
        diagram.startTransaction();
        (diagram.model as GojsModel).addLinkData(newLink);
        diagram.commitTransaction();

        expect(modelChangeCallback.mock.calls.length).toBe(1);
        const changeEvent = modelChangeCallback.mock.calls[0][0];
        expect(changeEvent.eventType).toBe(ModelChangeEventType.Add);
        expect(changeEvent.linkData.from).toBe(newLink.from);
        expect(changeEvent.linkData.to).toBe(newLink.to);
        expect(changeEvent.nodeData).toBeUndefined();
    });

    it('should trigger model changed events when a node is removed', () => {
        checkIfDiagramRendersModel(model, diagram);

        const nodeToRemoveName = 'Delta';
        const nodeToRemove = diagram.nodes.filter(node => node.key === nodeToRemoveName).first();
        diagram.startTransaction();
        diagram.remove(nodeToRemove);
        diagram.commitTransaction();

        // 2 times: 1 removed node and 1 removed link (because the removed node was linked to another node)
        expect(modelChangeCallback.mock.calls.length).toBe(2);
        const removeLinkChangeEvent = modelChangeCallback.mock.calls[0][0];
        expect(removeLinkChangeEvent.eventType).toBe(ModelChangeEventType.Remove);
        expect(removeLinkChangeEvent.linkData.from).toBe('Beta');
        expect(removeLinkChangeEvent.linkData.to).toBe(nodeToRemoveName);
        expect(removeLinkChangeEvent.nodeData).toBeUndefined();

        const removeNodeChangeEvent = modelChangeCallback.mock.calls[1][0];
        expect(removeNodeChangeEvent.eventType).toBe(ModelChangeEventType.Remove);
        expect(removeNodeChangeEvent.nodeData.key).toBe(nodeToRemoveName);
        expect(removeNodeChangeEvent.nodeData.color).toBe('pink');
        expect(removeNodeChangeEvent.linkData).toBeUndefined();
    });

    it('should trigger a model changed event when a link is removed', () => {
        checkIfDiagramRendersModel(model, diagram);

        const linkFrom = 'Gamma';
        const linkTo = 'Omega';
        const linkToRemove = diagram.links.filter(link =>
            link.fromNode.key === linkFrom && link.toNode.key === linkTo).first();
        diagram.startTransaction();
        diagram.remove(linkToRemove);
        diagram.commitTransaction();

        expect(modelChangeCallback.mock.calls.length).toBe(1);
        const removeLinkChangeEvent = modelChangeCallback.mock.calls[0][0];
        expect(removeLinkChangeEvent.eventType).toBe(ModelChangeEventType.Remove);
        expect(removeLinkChangeEvent.linkData.from).toBe(linkFrom);
        expect(removeLinkChangeEvent.linkData.to).toBe(linkTo);
        expect(removeLinkChangeEvent.nodeData).toBeUndefined();
    });
});

const checkIfDiagramRendersModel = (model, diagram: Diagram) => {
    expect(diagram.nodes.count).toBe(model.nodeDataArray.length);
    model.nodeDataArray.forEach(node => {
        expect(diagram.nodes.any(e => e.key === node.key && e.data.color === node.color)).toBeTruthy();
    });
    diagram.nodes.each(node => {
        expect(model.nodeDataArray.findIndex(e => e.key === node.key && e.color === node.data.color) >= 0).toBeTruthy();
    });
    model.linkDataArray.forEach(link => {
        expect(diagram.links.any(e => e.fromNode.key === link.from && e.toNode.key === link.to)).toBeTruthy();
    });
    diagram.links.each(link => {
        expect(model.linkDataArray.findIndex(e =>
            e.from === link.fromNode.key && e.to === link.toNode.key) >= 0).toBeTruthy();
    });
};