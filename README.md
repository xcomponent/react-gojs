[![Build Status](https://travis-ci.org/xcomponent/react-gojs.svg?branch=master)](https://travis-ci.org/xcomponent/react-gojs)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.png?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Coverage Status](https://coveralls.io/repos/github/xcomponent/react-gojs/badge.svg?branch=master)](https://coveralls.io/github/xcomponent/react-gojs?branch=master)

# react-gojs

_react-gojs_ is a [GoJS](https://gojs.net/latest/index.html) React integration.

## Install

Install it from npm. It has peer dependencies of react and react-dom, which will have to be installed as well.

```bash
npm install --save react-gojs
```

or:

```bash
yarn add react-gojs
```

## Usage

Import `GojsDiagram` in your React component:

```javascript static
import GojsDiagram from 'react-gojs';
```

To create a GoJS diagram, just use the _GojsDiagram_ React component:

```tsx
<GojsDiagram
    diagramId="myDiagramDiv"
    model={this.props.model}
    createDiagram={this.createDiagram}
    className="myDiagram"
    onModelChange={this.modelChangedhandler}
/>
```

_GojsDiagram_ is a generic React component which is responsible for rendering and updating (when the model changes) the diagram. The render step is based on the model and the go.Diagram object provided as props. It acts as a go.Diagram wrapper.

_GojsDiagram_ props:

-   diagramId: _id_ required by GoJS.
-   model: generic model containing nodes and links.

Model type: _DiagramModel<N extends BaseNodeModel, L extends LinkModel>_

Example (_Typescript / Javascript_):

```ts
const model = {
    nodeDataArray: [
        { key: 'Alpha', color: 'lightblue' },
        { key: 'Beta', color: 'orange' },
        { key: 'Gamma', color: 'lightgreen' },
        { key: 'Delta', color: 'pink' },
        { key: 'Omega', color: 'grey' }
    ],
    linkDataArray: [
        { from: 'Alpha', to: 'Beta' },
        { from: 'Alpha', to: 'Gamma' },
        { from: 'Beta', to: 'Delta' },
        { from: 'Gamma', to: 'Omega' }
    ]
};
```

-   createDiagram: method called by the React component to create the customized GoJS diagram object. It enables you to customize the look and feel.

_Typescript_ example:

```tsx
const createDiagram = (diagramId: string): Diagram => {
    const $ = go.GraphObject.make;

    const myDiagram: Diagram = $(go.Diagram, diagramId, {
        initialContentAlignment: go.Spot.LeftCenter
    });

    myDiagram.nodeTemplate = $(
        go.Node,
        'Auto',
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 0 }, new go.Binding('fill', 'color')),
        $(go.TextBlock, { margin: 8 }, new go.Binding('text', 'key'))
    );

    return myDiagram;
};
```

_Javascript (ES6)_ example:

```jsx
const createDiagram = diagramId => {
    const $ = go.GraphObject.make;

    const myDiagram = $(go.Diagram, diagramId, {
        initialContentAlignment: go.Spot.LeftCenter
    });

    myDiagram.nodeTemplate = $(
        go.Node,
        'Auto',
        $(go.Shape, 'RoundedRectangle', { strokeWidth: 0 }, new go.Binding('fill', 'color')),
        $(go.TextBlock, { margin: 8 }, new go.Binding('text', 'key'))
    );

    return myDiagram;
};
```

-   className: css applied to the _div_ containing our diagram. You should define at least width and height.

Example:

```css
.myDiagram {
    width: 70%;
    height: 400px;
}
```

-   onModelChange: the _onModelChange_ event occurs when the diagram model has changed (add/remove nodes/links from the UI). This event is very useful to keep your model (provided as prop) in sync with the diagram.

For example, in a Redux environment, the diagram model should be immutable (and stored in the redux store). The _onModelChange_ handler can dispatch actions to update the model.

## Examples

-   _Typescript_: You can find a react / redux / react-gojs example + live demo [here](https://github.com/nicolaserny/react-gojs-example).

-   _Javascript (ES6)_: You can find a react / react-gojs example + live demo [here](https://github.com/nicolaserny/react-gojs-example-es6).

## Contributing

### Build and Test

```
yarn install
```

```
yarn build
```

```
yarn test
```

### Submit a Pull Request

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request

## License

[Apache License V2](https://raw.githubusercontent.com/xcomponent/react-gojs/master/LICENSE)
