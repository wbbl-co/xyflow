import { useCallback, useEffect, useState } from "react";
import { Edge, Node, OnEdgesChange, OnNodesChange } from "../types";
import { EdgeChange, NodeChange, applyEdgeChanges, applyNodeChanges } from "..";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";


export type UseOptimism<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
    edges: EdgeType[],
    nodes: NodeType[],

    onNodesChange: OnNodesChange<NodeType>,
    onEdgesChange: OnEdgesChange<EdgeType>,
};

export function useOptimism<NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: { timeout?: number } & UseOptimism<NodeType, EdgeType>): UseOptimism<NodeType, EdgeType> {
    const [nodes, setNodes] = useState<NodeType[]>([]);
    const [edges, setEdges] = useState<EdgeType[]>([]);
    const [, setNodeChanges] = useState<NodeChange<NodeType>[]>([]);
    const [, setEdgeChanges] = useState<EdgeChange<EdgeType>[]>([]);
    useEffect(() => {
        setEdges(props.edges);
    }, [props.edges]);
    useEffect(() => {
        setNodes(props.nodes);
    }, [props.nodes]);
    const onNodesChange = useCallback((changes: NodeChange<NodeType>[]) => {
        setNodeChanges((oldChanges) => oldChanges.concat(changes));
        setNodes(nodes => applyNodeChanges(changes, nodes));
    }, [setNodes, setNodeChanges]);
    const onEdgesChange = useCallback((changes: EdgeChange<EdgeType>[]) => {
        setEdgeChanges((oldChanges) => oldChanges.concat(changes));
        setEdges(edges => applyEdgeChanges(changes, edges));
    }, [setNodes, setEdgeChanges]);


    useIsomorphicLayoutEffect(() => {
        const handle = requestIdleCallback(() => {
            setNodeChanges((changes) => {
                props.onNodesChange(changes);
                return []
            })
        }, { timeout: props.timeout });
        return () => { cancelIdleCallback(handle) };
    }, [setNodeChanges, props.onNodesChange]);

    useIsomorphicLayoutEffect(() => {
        const handle = requestIdleCallback(() => {
            setEdgeChanges((changes) => {
                props.onEdgesChange(changes);
                return []
            })
        }, { timeout: props.timeout });
        return () => { cancelIdleCallback(handle) };
    }, [setEdgeChanges, props.onEdgesChange]);

    return { nodes, edges, onNodesChange, onEdgesChange };

}
