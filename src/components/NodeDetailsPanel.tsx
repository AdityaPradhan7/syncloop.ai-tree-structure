import React, { useEffect, useRef } from 'react';
import './NodeDetailsPanel.css';

interface NodeDetailsProps {
  isOpen: boolean;
  nodeType: string;
  nodeData: any;
  onClose: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsProps> = ({ isOpen, nodeType, nodeData, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when panel opens or node changes
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen, nodeData]);

  if (!isOpen) return null;

  // Determine which fields to display based on node type
  const renderFields = () => {
    // Default fields for all node types
    const fields = [
      { name: 'name', label: 'Name', type: 'input' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ];

    // Add specific fields based on node type
    if (nodeType === 'API') {
      fields.push(
        { name: 'method', label: 'Method', type: 'input' },
        { name: 'endpoint', label: 'Endpoint', type: 'input' },
        { name: 'payload', label: 'Payload', type: 'textarea' },
        { name: 'input_params', label: 'Input Parameters', type: 'input' },
        { name: 'output_params', label: 'Output Parameters', type: 'input' }
      );
    }

    return fields.map((field) => (
      <div className="node-details-field" key={field.name}>
        <label htmlFor={field.name}>{field.label}:</label>
        {field.type === 'input' ? (
          <input
            type="text"
            id={field.name}
            value={nodeData?.[field.name] || ''}
            readOnly
          />
        ) : (
          <textarea
            id={field.name}
            value={nodeData?.[field.name] || ''}
            readOnly
            rows={3}
          />
        )}
      </div>
    ));
  };

  return (
    <div className={`node-details-panel ${isOpen ? 'open' : ''}`}>
      <div className="node-details-header">
        <h2>{nodeType} Details</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="node-details-content" ref={contentRef}>
        {nodeData ? (
          renderFields()
        ) : (
          <p>No details available for this node.</p>
        )}
      </div>
    </div>
  );
};

export default NodeDetailsPanel; 