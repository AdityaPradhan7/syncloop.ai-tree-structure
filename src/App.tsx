import { useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  BackgroundVariant
} from 'reactflow';
import type { NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './components/CustomNode';
import NodeDetailsPanel from './components/NodeDetailsPanel';
import { processData } from './utils/processData';
import './components/FlowStyles.css';
import './components/FlowContainer.css';
import data from './data/data.json';

// Define node types
const nodeTypes = {
  customNode: CustomNode,
};

// Interface for node data from JSON
interface NodeDetails {
  name?: string;
  description?: string;
  method?: string;
  endpoint?: string;
  payload?: string;
  input_params?: string;
  output_params?: string;
  [key: string]: any;
}

// Map to store node details by ID
const nodeDetailsMap: Record<string, { type: string; data: NodeDetails }> = {};

// Function to get the proper display name for node types
const getNodeTypeDisplay = (nodeType: string): string => {
  switch (nodeType) {
    case 'api':
      return 'API';
    case 'tool':
      return 'Tool';
    case 'agent':
      return 'Agent';
    case 'team':
      return 'Business Team';
    case 'application':
    case 'root':
      return 'Application';
    default:
      return nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
  }
};

// Function to extract node details from JSON
const extractNodeDetails = () => {
  try {
    // Extract root node details
    nodeDetailsMap['root'] = {
      type: 'application',
      data: {
        name: data.name || 'Application',
        description: data.description || ''
      }
    };
    
    // Create maps to store node IDs by their position in the hierarchy
    const teamIds: Record<number, string> = {};
    const agentIds: Record<number, string> = {};
    const toolIds: Record<number, string> = {};
    const apiIds: Record<number, string> = {};
    
    // First pass: Create all node IDs based on the processData.ts logic
    let teamCounter = 1;
    let agentCounter = 1;
    let toolCounter = 1;
    let apiCounter = 1;
    
    // Extract team details
    if (data.business_teams && Array.isArray(data.business_teams)) {
      data.business_teams.forEach((teamEntry: any) => {
        const teamKey = Object.keys(teamEntry)[0];
        const team = teamEntry[teamKey];
        
        if (team && team.name) {
          const teamId = `team-${teamCounter}`;
          teamIds[teamCounter] = teamId;
          teamCounter++;
          
          // Store team details
          nodeDetailsMap[teamId] = {
            type: 'team',
            data: {
              name: team.name,
              description: team.description || ''
            }
          };
          
          // Extract agent details
          if (team.agents && Array.isArray(team.agents)) {
            team.agents.forEach((agentEntry: any) => {
              const agentKey = Object.keys(agentEntry)[0];
              const agent = agentEntry[agentKey];
              
              if (agent && agent.name) {
                const agentId = `agent-${agentCounter}`;
                agentIds[agentCounter] = agentId;
                agentCounter++;
                
                // Store agent details
                nodeDetailsMap[agentId] = {
                  type: 'agent',
                  data: {
                    name: agent.name,
                    description: agent.description || ''
                  }
                };
                
                // Extract tool details
                if (agent.tools && Array.isArray(agent.tools)) {
                  agent.tools.forEach((toolEntry: any) => {
                    const toolKey = Object.keys(toolEntry)[0];
                    const tool = toolEntry[toolKey];
                    
                    if (tool && tool.name) {
                      const toolId = `tool-${toolCounter}`;
                      toolIds[toolCounter] = toolId;
                      toolCounter++;
                      
                      // Store tool details
                      nodeDetailsMap[toolId] = {
                        type: 'tool',
                        data: {
                          name: tool.name,
                          description: tool.description || ''
                        }
                      };
                      
                      // Extract API details
                      if (tool.apis && Array.isArray(tool.apis)) {
                        tool.apis.forEach((apiEntry: any) => {
                          const apiKey = Object.keys(apiEntry)[0];
                          const api = apiEntry[apiKey];
                          
                          if (api && api.name) {
                            const apiId = `api-${apiCounter}`;
                            apiIds[apiCounter] = apiId;
                            apiCounter++;
                            
                            // Store API details with all fields
                            nodeDetailsMap[apiId] = {
                              type: 'api',
                              data: {
                                name: api.name,
                                description: api.description || '',
                                method: api.method || '',
                                endpoint: api.endpoint || '',
                                payload: api.payload || '',
                                input_params: api.input_params || '',
                                output_params: api.output_params || ''
                              }
                            };
                          }
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
    
    console.log("Node details extracted:", nodeDetailsMap);
  } catch (error) {
    console.error('Error extracting node details:', error);
  }
};

function App() {
  // Extract node details on component mount
  useEffect(() => {
    extractNodeDetails();
  }, []);
  
  // Get processed data
  const { nodes: initialNodes, edges: initialEdges } = processData();
  
  // Setup state for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // State for details panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState('');
  const [selectedNodeData, setSelectedNodeData] = useState<NodeDetails | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Update nodes when selectedNodeId changes
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => {
        return {
          ...node,
          data: {
            ...node.data,
            isSelected: node.id === selectedNodeId
          },
        };
      })
    );
  }, [selectedNodeId, setNodes]);
  
  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Determine node type from ID (e.g., "api-1" -> "api")
    const nodeType = node.id.split('-')[0];
    
    // Get node details from map
    const nodeDetails = nodeDetailsMap[node.id];
    
    if (nodeDetails) {
      setSelectedNodeType(getNodeTypeDisplay(nodeDetails.type));
      setSelectedNodeData(nodeDetails.data);
    } else {
      // Fallback if no details found
      setSelectedNodeType(getNodeTypeDisplay(nodeType));
      setSelectedNodeData({ name: node.data.label });
    }
    
    setSelectedNodeId(node.id);
    setIsPanelOpen(true);
  }, []);
  
  // Close panel
  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedNodeId(null);
  };

  return (
    <div className="flow-container">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={16}      
            size={1}       
            color="#212121"
          />
          <Controls />
        </ReactFlow>
        
        {/* Node Details Panel */}
        <NodeDetailsPanel
          isOpen={isPanelOpen}
          nodeType={selectedNodeType}
          nodeData={selectedNodeData}
          onClose={closePanel}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
