import React, { useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  isNode,
} from 'react-flow-renderer';
import dagre from 'dagre';
import Graph from "react-graph-vis";


import {buildActionSetToShift, buildActionChangeParent, buildActionDeleteNode} from './../../redux/Actions';
import {store} from './../../../../../../../../index';

import SituationNode from './../../data/entity/SituationNode';
import OperationNode from './../../data/entity/OperationNode';
import ContextNode from './../../data/entity/ContextNode';


const icon_url_situation_node = process.env.PUBLIC_URL + "/images/alarm-light.png";
const icon_url_operation_node = process.env.PUBLIC_URL + "/images/cogs.png";
const icon_url_context_node = process.env.PUBLIC_URL + "/images/leak.png";




const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;


function SituationTemplateUI(props) {

    const graphNodes = [];
    
    // This modifies the tree to make it react flow renderer compatible 
    const graph = createGraph(null, props.root, graphNodes, getSelectedNodeID(props));
    // this dynamically assigns the position value that was in the tutorial
    const layoutedElements = getLayoutedElements(graph);
    console.log('stateChange',graph);
  
    const [elements, setElements] = useState(layoutedElements);
    

    const onConnect = (params) => {
        console.log('connect',params);
        setElements((els) => addEdge({ ...params, animated: true }, els));
    }
    
    const onElementsRemove = (elementsToRemove) =>{
        console.log('remove',elementsToRemove);
        setElements((els) => removeElements(elementsToRemove, els));

    }
    const onElementClick = (event, element) => {
        console.log('click', element);
        let selectedNodeID = element.id;

    }
    
 
   
  

  return (
    <div style={{height : 700}}>
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          onElementClick={onElementClick}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
        />
      </ReactFlowProvider>
    </div>
  );
}

function createGraph(parent, curNode, graphNodes, selectedNodeID) {
     
    if(curNode != null) {
        let curNodeID = curNode.getNodeId();
        let curNodeName = curNode.getNodeName();
        let node = buildVISNode(curNode, selectedNodeID);
        graphNodes.push(node);
        if(parent != null) {
            let parentNodeID = parent.getNodeId();
            let edge = {id: 'e'+parentNodeID+'-'+curNodeID,source: parentNodeID,target: curNodeID, animated: true };
            graphNodes.push(edge);
        }
        let curNodeChildrenArr = curNode.getChildren();
        for(let index = 0; index < curNodeChildrenArr.length; index++) {
            createGraph(curNode, curNodeChildrenArr[index], graphNodes, selectedNodeID);
            
        }

    }
    
    return graphNodes;
}

function buildVISNode(curNode, selectedNodeID) {
    let node = null;
    if(curNode != null) {
        let curNodeID = curNode.getNodeId();
        let curNodeName = curNode.getNodeName();
        node = {id: curNodeID, data: { label: curNodeName }, position: { x: 100, y: 125 }};
        if(curNode.type === "situationNode") {
            node.type = 'input';
        }
        
    }
    return node;
}

function getSelectedNodeID(props) {
    let selectedNodeID = null;
    let selectedNode = props.getSelectedNode();
    if(selectedNode != null) {
        selectedNodeID = selectedNode.getNodeId();
    }
    return selectedNodeID;
} 


const getLayoutedElements = (elements, direction = 'TB') => {
    
    dagreGraph.setGraph({ rankdir: direction });
  
    elements.forEach((el) => {
      if (isNode(el)) {
        dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
      } else {
        dagreGraph.setEdge(el.source, el.target);
      }
    });
  
    dagre.layout(dagreGraph);
  
    return elements.map((el) => {
      if (isNode(el)) {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = 'top';
        el.sourcePosition = 'bottom';
  
        
        el.position = {
          x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
          y: nodeWithPosition.y - nodeHeight / 2,
        };
      }
  
      return el;
    });
  };

export default SituationTemplateUI;
