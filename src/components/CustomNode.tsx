import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  isSelected?: boolean;
  nodeId?: string;
}

// let color='#3983F4';

// Define node colors based on hierarchy level
const nodeColors = {
  root: ' #c5e5e8',      // Application - #016bbd
  team: ' #e7daec',      // Business Team - #0052B2
  agent: ' #ffdfa5',     // Agent - #153092
  tool: ' #c6def2',      // Tool - #112A72
  api: ' #d3efc7' // API - #132854
};

const nodeBorders = {
  root: '2px solid #8ac6cb',      // Application - #016bbd
  team: '2px solid #d9abe4',      // Business Team - #0052B2
  agent: '2px solid #edc681',     // Agent - #153092
  tool: '2px solid #98c3e5',      // Tool - #112A72
  api: '2px solid #aedd9a' // API - #132854
};

// Box shadow style for selected nodes
const selectedBoxShadow = '0 0 0 1px rgba(0, 0, 0, 0.2), 12px 12px 20px rgba(0, 0, 0, 0.25)';

const CustomNode = ({ data, id }: NodeProps<CustomNodeData>) => {
  // Determine node type from the ID prefix
  let nodeType = 'root';
  if (id.startsWith('team-')) nodeType = 'team';
  else if (id.startsWith('agent-')) nodeType = 'agent';
  else if (id.startsWith('tool-')) nodeType = 'tool';
  else if (id.startsWith('api-')) nodeType = 'api';

  return (
    <>
      {/* ID display above node */}
      {data.nodeId && (
        <div
          style={{
            position: 'absolute',
            top: '-31px',
            width: '100%',
            textAlign: 'left',
            color: 'rgba(102, 102, 102, 0.89)',
            fontSize: '21.4px',
            marginLeft: '10px',
            fontWeight: '500',
            fontFamily: "Figtree",
            fontOpticalSizing: 'auto',
            fontStyle: 'normal',
          }}
        >
          {data.nodeId}
        </div>
      )}
      <div 
        className="custom-node" 
        style={{ 
          backgroundColor: nodeColors[nodeType as keyof typeof nodeColors],
          border: nodeBorders[nodeType as keyof typeof nodeBorders],
          boxShadow: data.isSelected ? selectedBoxShadow : 'none'
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
    </>
  );
};

export default memo(CustomNode); 