import React from "react";

// Define Props interface
interface WorkflowLayoutProps {
  workflow: React.ReactNode;
  content: React.ReactNode;
}

const WorkflowLayout: React.FC<WorkflowLayoutProps> = ({ workflow, content }) => {
  return (
    <div className="flex h-full">
      {/* Workflow Steps Panel */}
      <div className="w-[320px] border-r">
        {workflow}
      </div>

      {/* Content Panel */}
      <div className="flex-1">
        {content}
      </div>
    </div>
  );
};

export default WorkflowLayout;
