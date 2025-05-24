import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  isSelected?: boolean;
}

let color='#3983F4';

// Define node colors based on hierarchy level
const nodeColors = {
  root: color,      // Application - #016bbd
  team: color,      // Business Team - #0052B2
  agent: color,     // Agent - #153092
  tool: color,      // Tool - #112A72
  api: color       // API - #132854
};

// Box shadow style for selected nodes
//const selectedBoxShadow = '0 0 15px 2px rgba(255, 0, 0, 0.7)';
const selectedNodeColor = ' #2b59ff'; // #306eff

const CustomNode = ({ data, id }: NodeProps<CustomNodeData>) => {
  // Determine node type from the ID prefix
  let nodeType = 'root';
  if (id.startsWith('team-')) nodeType = 'team';
  else if (id.startsWith('agent-')) nodeType = 'agent';
  else if (id.startsWith('tool-')) nodeType = 'tool';
  else if (id.startsWith('api-')) nodeType = 'api';

  return (
    <div 
      className="custom-node" 
      style={{ 
        backgroundColor: data.isSelected ? selectedNodeColor : nodeColors[nodeType as keyof typeof nodeColors]
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="target-handle"
      />
      <div className="node-content">{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="source-handle"
      />
    </div>
  );
};

export default memo(CustomNode); 