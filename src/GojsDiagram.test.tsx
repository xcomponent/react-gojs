import * as React from 'react';
import * as go from 'gojs';
import { Diagram } from 'gojs';
import { mount } from 'enzyme';
import GojsDiagram from './GojsDiagram';

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

    beforeEach(() => {
        const dom = document.body;
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