import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { uploadFile } from '../utilities/IfcFileLoader';
import { Icon } from "@iconify/react";

interface IfcDropZoneProps {
  onFileUpload: (file: File) => void;
}

const IfcDropZone: React.FC<IfcDropZoneProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log("dropping file now...")

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.name.endsWith('.ifc')) {
        onFileUpload(file);
      } else {
        console.warn('Skipping non-IFC file:', file.name);
      }
    });
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("handleing files now")
    if (files) {
      handleFiles(files);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        // height:"100%",
        pointerEvents: "auto",
        border: `2px dashed ${isDragging ? 'blue' : 'gray'}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 1000,  
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".ifc"
        style={{ display: 'none' }}
        multiple
      />
 {/* <Icon
              icon={isDragging ? "system-uicons:box" : "system-uicons:boxes"}
            /> */}
                  {isDragging ? 'Drop IFC files here' : 'Drag & Drop IFC files here or click to select'}
    </div>
  );
};

export default IfcDropZone;