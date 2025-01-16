import React from 'react';

const WorkflowLayout = ({ workflow, content }) => {
  return (
    <div className="flex h-full">
      {/* Workflow Steps Panel */}
      <div className="w-[400px] border-r flex flex-col bg-white">
        {workflow}
      </div>
      
      {/* Content Panel */}
      <div className="flex-1 overflow-y-auto">
        {content}
      </div>
    </div>
  );
};

export default WorkflowLayout; 