import type { Node, Edge } from 'reactflow';
import data from '../data/data.json';

interface NodeData {
  label: string;
  hidden?: boolean;
}

// Define interfaces for hierarchy objects
interface ApiObject {
  name: string;
  id: string;
  x: number;
  y: number;
  hidden?: boolean;
}

interface ToolObject {
  name: string;
  id: string;
  apis: ApiObject[];
  x?: number;
  y?: number;
  hidden?: boolean;
}

interface AgentObject {
  name: string;
  id: string;
  tools: ToolObject[];
  x?: number;
  y?: number;
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
  teams: TeamObject[];
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
  const baseHorizontalSpacing = 300; // Spacing for sibling nodes with no children
  const apiHorizontalSpacing = 410;  // Spacing between API nodes
  const verticalSpacing = 230;       // Spacing between levels
  
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
    api: verticalSpacing * 4,    // 480
    tool: verticalSpacing * 3,   // 360
    agent: verticalSpacing * 2,  // 240
    team: verticalSpacing,       // 120
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

  // Create a structured representation of the hierarchy for bottom-up processing
  const hierarchy: Hierarchy = {
    name: data.name || "Organization", // Get root name from JSON or default to "Organization"
    teams: [],
  };

  // Check if business_teams exists and is an array
  const hasTeams = data.business_teams && Array.isArray(data.business_teams) && data.business_teams.length > 0;
  
  // First pass - build hierarchy structure and add API nodes
  if (hasTeams) {
    data.business_teams.forEach((team) => {
      const teamKey = Object.keys(team)[0];
      const teamData = team[teamKey as keyof typeof team];
      if (!teamData || !teamData.name) return;
      
      const teamObj: TeamObject = {
        name: teamData.name,
        id: `team-${teamNodeCounter++}`,
        agents: [],
      };
      
      if (teamData.agents) {
        teamData.agents.forEach((agent) => {
          const agentKey = Object.keys(agent)[0];
          const agentData = agent[agentKey as keyof typeof agent];
          if (!agentData || !agentData.name) return;
          
          const agentObj: AgentObject = {
            name: agentData.name,
            id: `agent-${agentNodeCounter++}`,
            tools: [],
          };
          
          if (agentData.tools) {
            // Use any[] to avoid TypeScript errors with the dynamic structure
            agentData.tools.forEach((toolEntry: any) => {
              // Extract the tool using its key (e.g., "tool_1")
              const toolKey = Object.keys(toolEntry)[0];
              const tool = toolEntry[toolKey];
              if (!tool || !tool.name) return;
              
              const toolObj: ToolObject = {
                name: tool.name,
                id: `tool-${toolNodeCounter++}`,
                apis: [],
              };
              
              let hasApis = false;
              
              if (tool.apis && Array.isArray(tool.apis)) {
                // Use any[] to avoid TypeScript errors with the dynamic structure
                tool.apis.forEach((apiEntry: any) => {
                  // Extract the API using its key (e.g., "api_1")
                  const apiKey = Object.keys(apiEntry)[0];
                  const api = apiEntry[apiKey];
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
                
                // Increment X position for next node
                currentApiX += baseHorizontalSpacing;
              }
              
              // Add tool to agent
              agentObj.tools.push(toolObj);
            });
          }
          
          // If agent has no tools, create a hidden anchor node for it
          if (agentObj.tools.length === 0) {
            const anchorId = `anchor-agent-${anchorNodeCounter++}`;
            const anchorToolObj: ToolObject = {
              name: `${agentData.name} Anchor`,
              id: anchorId,
              apis: [],
              hidden: true,
            };
            
            // Create an anchor API node for this tool
            const anchorApiId = `anchor-api-${anchorNodeCounter++}`;
            const anchorApiObj: ApiObject = {
              name: `${agentData.name} API Anchor`,
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
              name: `${agentData.name} API Anchor`,
              hidden: true,
            };
            
            // Add anchor API to anchor tool
            anchorToolObj.apis.push(anchorApiObj);
            
            // Add anchor tool to agent
            agentObj.tools.push(anchorToolObj);
            
            // Increment X position for next node
            currentApiX += baseHorizontalSpacing;
          }
          
          // Add agent to team
          teamObj.agents.push(agentObj);
        });
      }
      
      // If team has no agents, create a hidden anchor node for it
      if (teamObj.agents.length === 0) {
        const anchorId = `anchor-team-${anchorNodeCounter++}`;
        const anchorAgentObj: AgentObject = {
          name: `${teamData.name} Anchor`,
          id: anchorId,
          tools: [],
          hidden: true,
        };
        
        // Create an anchor tool node for this agent
        const anchorToolId = `anchor-tool-${anchorNodeCounter++}`;
        const anchorToolObj: ToolObject = {
          name: `${teamData.name} Tool Anchor`,
          id: anchorToolId,
          apis: [],
          hidden: true,
        };
        
        // Create an anchor API node for this tool
        const anchorApiId = `anchor-api-${anchorNodeCounter++}`;
        const anchorApiObj: ApiObject = {
          name: `${teamData.name} API Anchor`,
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
          name: `${teamData.name} API Anchor`,
          hidden: true,
        };
        
        // Add anchor API to anchor tool
        anchorToolObj.apis.push(anchorApiObj);
        
        // Add anchor tool to anchor agent
        anchorAgentObj.tools.push(anchorToolObj);
        
        // Add anchor agent to team
        teamObj.agents.push(anchorAgentObj);
        
        // Increment X position for next node
        currentApiX += baseHorizontalSpacing;
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
    // If there are no teams or no team positions, place root node at center
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
    data: { label: nodeInfo.root?.name || data.name || "Organization" },
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
      nodes.push({
        id: info.id,
        type: 'customNode',
        data: { label: info.name },
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