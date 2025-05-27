import type { Node, Edge } from 'reactflow';
//import data from '../data/data.json';

interface NodeData {
  label: string;
  hidden?: boolean;
  nodeId?: string;
}

// Define interfaces for hierarchy objects
interface ApiObject {
  name: string;
  id: string;
  x?: number;
  y?: number;
  hidden?: boolean;
}

interface ToolObject {
  name: string;
  id: string;
  apis: ApiObject[];
  hidden?: boolean;
}

interface AgentObject {
  name: string;
  id: string;
  tools: ToolObject[];
  hidden?: boolean;
}

interface TeamObject {
  name: string;
  id: string;
  agents: AgentObject[];
  x?: number;
  y?: number;
  hidden?: boolean;
}

interface Hierarchy {
  name: string;
  id?: string;
  teams: TeamObject[];
}

// Define types to match the JSON structure
interface ApiData {
  name: string;
  id: string;
  description?: string;
  method?: string;
  endpoint?: string;
  payload?: string;
  input_params?: string;
  output_params?: string;
}

interface ToolData {
  name: string;
  id: string;
  description?: string;
  apis?: ApiData[];
}

interface AgentData {
  name: string;
  id: string;
  description?: string;
  tools?: ToolData[];
}

interface TeamData {
  name: string;
  id: string;
  description?: string;
  agents?: AgentData[];
}

interface BusinessTeam {
  [key: string]: TeamData;
}

// Define types to match the JSON structure - loosely typed with optional fields
interface ApiEntry {
  [key: string]: {
    name: string;
    description?: string;
    method?: string;
    endpoint?: string;
    payload?: string;
    input_params?: string;
    output_params?: string;
    [key: string]: any;
  }
}

interface ToolEntry {
  [key: string]: {
    name: string;
    description?: string;
    apis?: any[];
    [key: string]: any;
  }
}

export const processData = () => {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  
  // Configuration for spacing
  const baseHorizontalSpacing = 300;
  const apiHorizontalSpacing = 410;
  const verticalSpacing = 235;
  
  // Track node positions and names for labels
  const nodeInfo: {
    [key: string]: { 
      id: string; 
      x: number; 
      y: number; 
      name: string;
      parentId?: string; 
      hidden?: boolean; 
    };
  } = {};
  
  // Track level heights (y-coordinates)
  const levels = {
    api: verticalSpacing * 4,
    tool: verticalSpacing * 3,
    agent: verticalSpacing * 2,
    team: verticalSpacing,
    root: 0,
  };
  
  // Initialize counters for node IDs
  let apiNodeCounter = 1;
  let toolNodeCounter = 1;
  let agentNodeCounter = 1;
  let teamNodeCounter = 1;
  let anchorNodeCounter = 1;
  
  // Starting x position for the first API node
  let currentApiX = 100;

  const data = (window as any).template;

  // Create a structured representation of the hierarchy for bottom-up processing
  const hierarchy: Hierarchy = {
    name: data.name || "Application",
    teams: [],
  };

  // Check if business_teams exists and is an array
  const hasTeams = data.business_teams && Array.isArray(data.business_teams) && data.business_teams.length > 0;
  
  // First pass - build hierarchy structure and add API nodes
  if (hasTeams) {
    data.business_teams.forEach((team: TeamData) => {
      if (!team || !team.name) return;
      
      const teamObj: TeamObject = {
        name: team.name,
        id: `team-${teamNodeCounter++}`,
        agents: [],
      };
      
      if (team.agents && Array.isArray(team.agents)) {
        team.agents.forEach((agent: AgentData) => {
          if (!agent || !agent.name) return;
          
          const agentObj: AgentObject = {
            name: agent.name,
            id: `agent-${agentNodeCounter++}`,
            tools: [],
          };
          
          if (agent.tools && Array.isArray(agent.tools)) {
            agent.tools.forEach((tool: ToolData) => {
              if (!tool || !tool.name) return;
              
              const toolObj: ToolObject = {
                name: tool.name,
                id: `tool-${toolNodeCounter++}`,
                apis: [],
              };
              
              let hasApis = false;
              
              if (tool.apis && Array.isArray(tool.apis)) {
                tool.apis.forEach((api: ApiData) => {
                  if (!api || !api.name) return;
                  
                  hasApis = true;
                  
                  const apiObj: ApiObject = {
                    name: api.name,
                    id: `api-${apiNodeCounter++}`,
                    x: currentApiX,
                    y: levels.api,
                  };
                  
                  // Store API node position and name
                  nodeInfo[apiObj.id] = {
                    id: apiObj.id,
                    x: currentApiX,
                    y: levels.api,
                    name: api.name,
                  };
                  
                  // Add API to current tool
                  toolObj.apis.push(apiObj);
                  
                  // Increment X position for next API
                  currentApiX += apiHorizontalSpacing;
                });
              }
              
              // If tool has no APIs, create a hidden anchor node for it
              if (!hasApis) {
                const anchorId = `anchor-tool-${anchorNodeCounter++}`;
                const anchorApiObj: ApiObject = {
                  name: `${tool.name} Anchor`,
                  id: anchorId,
                  x: currentApiX,
                  y: levels.api,
                  hidden: true,
                };
                
                // Store anchor node position and name
                nodeInfo[anchorId] = {
                  id: anchorId,
                  x: currentApiX,
                  y: levels.api,
                  name: `${tool.name} Anchor`,
                  hidden: true,
                };
                
                // Add anchor to the tool's apis
                toolObj.apis.push(anchorApiObj);
                
                // Increment X position for next node using apiHorizontalSpacing for consistency
                currentApiX += apiHorizontalSpacing;
              }
              
              // Add tool to agent
              agentObj.tools.push(toolObj);
            });
          }
          
          // If agent has no tools, create a hidden anchor node for it
          if (agentObj.tools.length === 0) {
            const anchorId = `anchor-agent-${anchorNodeCounter++}`;
            const anchorToolObj: ToolObject = {
              name: `${agent.name} Anchor`,
              id: anchorId,
              apis: [],
              hidden: true,
            };
            
            // Create an anchor API node for this tool
            const anchorApiId = `anchor-api-${anchorNodeCounter++}`;
            const anchorApiObj: ApiObject = {
              name: `${agent.name} API Anchor`,
              id: anchorApiId,
              x: currentApiX,
              y: levels.api,
              hidden: true,
            };
            
            // Store anchor API node position and name
            nodeInfo[anchorApiId] = {
              id: anchorApiId,
              x: currentApiX,
              y: levels.api,
              name: `${agent.name} API Anchor`,
              hidden: true,
            };
            
            // Add anchor API to anchor tool
            anchorToolObj.apis.push(anchorApiObj);
            
            // Add anchor tool to agent
            agentObj.tools.push(anchorToolObj);
            
            // Increment X position for next node using apiHorizontalSpacing for consistency
            currentApiX += apiHorizontalSpacing;
          }
          
          // Add agent to team
          teamObj.agents.push(agentObj);
        });
      }
      
      // If team has no agents, create a hidden anchor node for it
      if (teamObj.agents.length === 0) {
        const anchorId = `anchor-team-${anchorNodeCounter++}`;
        const anchorAgentObj: AgentObject = {
          name: `${team.name} Anchor`,
          id: anchorId,
          tools: [],
          hidden: true,
        };
        
        // Create an anchor tool node for this agent
        const anchorToolId = `anchor-tool-${anchorNodeCounter++}`;
        const anchorToolObj: ToolObject = {
          name: `${team.name} Tool Anchor`,
          id: anchorToolId,
          apis: [],
          hidden: true,
        };
        
        // Create an anchor API node for this tool
        const anchorApiId = `anchor-api-${anchorNodeCounter++}`;
        const anchorApiObj: ApiObject = {
          name: `${team.name} API Anchor`,
          id: anchorApiId,
          x: currentApiX,
          y: levels.api,
          hidden: true,
        };
        
        // Store anchor API node position and name
        nodeInfo[anchorApiId] = {
          id: anchorApiId,
          x: currentApiX,
          y: levels.api,
          name: `${team.name} API Anchor`,
          hidden: true,
        };
        
        // Add anchor API to anchor tool
        anchorToolObj.apis.push(anchorApiObj);
        
        // Add anchor tool to anchor agent
        anchorAgentObj.tools.push(anchorToolObj);
        
        // Add anchor agent to team
        teamObj.agents.push(anchorAgentObj);
        
        // Increment X position for next node using apiHorizontalSpacing for consistency
        currentApiX += apiHorizontalSpacing;
      }
      
      // Add team to hierarchy
      hierarchy.teams.push(teamObj);
    });
  }
  
  // Step 2: Position Tool nodes at average of their API children
  hierarchy.teams.forEach((team) => {
    team.agents.forEach((agent) => {
      agent.tools.forEach((tool) => {
        if (tool.apis.length > 0) {
          // Calculate average X position of APIs
          const apiXSum = tool.apis.reduce((sum, api) => sum + nodeInfo[api.id].x, 0);
          const avgX = apiXSum / tool.apis.length;
          
          // Store Tool node position and name
          nodeInfo[tool.id] = {
            id: tool.id,
            x: avgX,
            y: levels.tool,
            name: tool.name,
            hidden: tool.hidden,
          };
        }
      });
    });
  });

  // Step 3: Position Agent nodes at average of their Tool children
  hierarchy.teams.forEach((team) => {
    team.agents.forEach((agent) => {
      if (agent.tools.length > 0) {
        // Calculate average X position of Tools
        const toolXSum = agent.tools.reduce((sum, tool) => sum + nodeInfo[tool.id].x, 0);
        const avgX = toolXSum / agent.tools.length;
        
        // Store Agent node position and name
        nodeInfo[agent.id] = {
          id: agent.id,
          x: avgX,
          y: levels.agent,
          name: agent.name,
          hidden: agent.hidden,
        };
      }
    });
  });

  // Step 4: Position Team nodes at average of their Agent children
  hierarchy.teams.forEach((team) => {
    if (team.agents.length > 0) {
      // Calculate average X position of Agents
      const agentXSum = team.agents.reduce((sum, agent) => sum + nodeInfo[agent.id].x, 0);
      const avgX = agentXSum / team.agents.length;
      
      // Store Team node position and name
      nodeInfo[team.id] = {
        id: team.id,
        x: avgX,
        y: levels.team,
        name: team.name,
        hidden: team.hidden,
      };
    }
  });

    // Step 5: Position root node at average of Team nodes or at center if no teams
  if (hierarchy.teams.length > 0) {
    const teamXSum = hierarchy.teams.reduce((sum, team) => {
      // Only include teams that have positions calculated
      if (nodeInfo[team.id]) {
        return sum + nodeInfo[team.id].x;
      }
      return sum;
    }, 0);
    const rootAvgX = teamXSum / (hierarchy.teams.filter(team => nodeInfo[team.id]).length || 1);
    
    // Store root node position and name
    nodeInfo.root = {
      id: 'root',
      x: rootAvgX,
      y: levels.root,
      name: hierarchy.name,
    };
  } else {
    // If there are no API nodes (shouldn't happen due to anchor nodes), place root node at center
    const centerX = 400; // Default center position
    
    // Store root node at center position
    nodeInfo.root = {
      id: 'root',
      x: centerX,
      y: levels.root,
      name: hierarchy.name,
    };
  }

  // Create nodes and edges based on the calculated positions
  // Root node - ALWAYS add the root node regardless of hierarchy
  nodes.push({
    id: 'root',
    type: 'customNode',
    data: { 
      label: nodeInfo.root?.name || data.name || "Organization",
      nodeId: data.id
    },
    position: { x: nodeInfo.root?.x || 400, y: nodeInfo.root?.y || levels.root },
  });

  // Add all other nodes from nodeInfo (except hidden ones)
  Object.values(nodeInfo).forEach((info) => {
    // Skip the root node (already added) and hidden nodes
    if (info.id === 'root' || info.hidden) return;

    // Check if this is an "anchor" node (hidden)
    const isAnchor = info.id.startsWith('anchor-');
    
    // Add to nodes array if it's not an anchor
    if (!isAnchor) {
      // Get the corresponding data from the JSON based on node type and ID
      let nodeId;
      const nodeType = info.id.split('-')[0];
      const nodeNumber = parseInt(info.id.split('-')[1]);

      if (nodeType === 'team' && data.business_teams) {
        const team = data.business_teams[nodeNumber - 1];
        if (team) {
          nodeId = team.id;
        }
      } else if (nodeType === 'agent') {
        // Search through all teams to find the agent
        let agentCount = 0;
        data.business_teams?.forEach((team: TeamData) => {
          team.agents?.forEach((agent: AgentData) => {
            agentCount++;
            if (agentCount === nodeNumber) {
              nodeId = agent.id;
            }
          });
        });
      } else if (nodeType === 'tool') {
        // Search through all teams and agents to find the tool
        let toolCount = 0;
        data.business_teams?.forEach((team: TeamData) => {
          team.agents?.forEach((agent: AgentData) => {
            agent.tools?.forEach((tool: ToolData) => {
              toolCount++;
              if (toolCount === nodeNumber) {
                nodeId = tool.id;
              }
            });
          });
        });
      } else if (nodeType === 'api') {
        // Search through all teams, agents, and tools to find the API
        let apiCount = 0;
        data.business_teams?.forEach((team: TeamData) => {
          team.agents?.forEach((agent: AgentData) => {
            agent.tools?.forEach((tool: ToolData) => {
              tool.apis?.forEach((api: ApiData) => {
                apiCount++;
                if (apiCount === nodeNumber) {
                  nodeId = api.id;
                }
              });
            });
          });
        });
      }

      nodes.push({
        id: info.id,
        type: 'customNode',
        data: { 
          label: info.name,
          nodeId: nodeId
        },
        position: { x: info.x, y: info.y },
      });
    }
  });

  // Team nodes and edges from root to teams
  hierarchy.teams.forEach((team) => {
    const info = nodeInfo[team.id];
    if (info && !info.hidden) {
      // Add edge from root to team
      edges.push({
        id: `edge-root-${team.id}`,
        source: 'root',
        target: team.id,
        type: 'smoothstep',
      });
      
      // Agent nodes and edges from team to agents
      team.agents.forEach((agent) => {
        const agentInfo = nodeInfo[agent.id];
        if (agentInfo && !agentInfo.hidden) {
          // Add edge from team to agent
          edges.push({
            id: `edge-${team.id}-${agent.id}`,
            source: team.id,
            target: agent.id,
            type: 'smoothstep',
          });
          
          // Tool nodes and edges from agent to tools
          agent.tools.forEach((tool) => {
            const toolInfo = nodeInfo[tool.id];
            if (toolInfo && !toolInfo.hidden) {
              // Add edge from agent to tool
              edges.push({
                id: `edge-${agent.id}-${tool.id}`,
                source: agent.id,
                target: tool.id,
                type: 'smoothstep',
              });
              
              // API nodes and edges from tool to APIs
              tool.apis.forEach((api) => {
                const apiInfo = nodeInfo[api.id];
                if (apiInfo && !apiInfo.hidden) {
                  // Add edge from tool to API
                  edges.push({
                    id: `edge-${tool.id}-${api.id}`,
                    source: tool.id,
                    target: api.id,
                    type: 'smoothstep',
                  });
                }
              });
            }
          });
        }
      });
    }
  });
  
  return { nodes, edges };
};