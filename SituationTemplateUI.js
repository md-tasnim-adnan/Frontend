import React from 'react';
import Graph from "react-graph-vis";

import {buildActionSetToShift, buildActionChangeParent} from './../../redux/Actions';
import {store} from './../../../../../../../../index';

import SituationNode from './../../data/entity/SituationNode';
import OperationNode from './../../data/entity/OperationNode';
import ContextNode from './../../data/entity/ContextNode';


const icon_url_situation_node = process.env.PUBLIC_URL + "/images/alarm-light.png";
const icon_url_operation_node = process.env.PUBLIC_URL + "/images/cogs.png";
const icon_url_context_node = process.env.PUBLIC_URL + "/images/leak.png";


function SituationTemplateUI(props) {

    const graph = createGraph(null, props.root, {nodes: [], edges: []}, getSelectedNodeID(props));

    const options = {
        layout: {
            hierarchical: true
        },
        edges: {
            color: "#000000"
        },
        physics: {
            enabled: false
        },
        height: "780px",
        clickToUse: false,
        autoResize: true
  };

  const events = {
    select: function(event) {
        var { nodes, edges } = event;
            if(nodes.length > 0) {
                let selectedNodeID = nodes[0];
                let state = store.getState();
                if(selectedNodeID != null && state.TEMPLATING_REDUCER_NAMESPACE.modeling.toShift) {
                    store.dispatch(buildActionChangeParent(selectedNodeID));
                }
                props.updateSelectedNode(selectedNodeID)
            }
        },
    hold: function(event) {
        var { nodes, edges } = event;
            if(nodes.length > 0) {
                store.dispatch(buildActionSetToShift());
            }
     }
  };

  return (
    <Graph graph={graph} options={options} events={events} getNetwork={network => {}}/>
  );
}

function createGraph(parent, curNode, graph, selectedNodeID) {
    if(curNode != null) {
        let curNodeID = curNode.getNodeId();
        let curNodeName = curNode.getNodeName();
        let node = buildVISNode(curNode, selectedNodeID);
        graph.nodes.push(node);
        if(parent != null) {
            let parentNodeID = parent.getNodeId();
            let edge = {from: curNodeID, to: parentNodeID, physics: true };
            graph.edges.push(edge);
        }
        let curNodeChildrenArr = curNode.getChildren();
        for(let index = 0; index < curNodeChildrenArr.length; index++) {
            createGraph(curNode, curNodeChildrenArr[index], graph, selectedNodeID);
        }
    }
    return graph;
}

function buildVISNode(curNode, selectedNodeID) {
    let node = null;
    if(curNode != null) {
        let curNodeID = curNode.getNodeId();
        let curNodeName = curNode.getNodeName();
        node = {id: curNodeID, label: curNodeName, title: curNodeName, shape: 'image'};
        if(curNode.type === "situationNode") {
            node.image = icon_url_situation_node;
        }
        else if(curNode.type === "operationNode") {
            node.image = icon_url_operation_node;
        }
        else {
            node.image = icon_url_context_node;
        }
        if(selectedNodeID == curNode.getNodeId()) {
            node.font = {};
            node.font.color="#f50057";
        }
        else {
            node.font = {};
            node.font.color = "black";
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


export default SituationTemplateUI;
