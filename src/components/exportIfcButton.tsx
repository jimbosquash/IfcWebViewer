import React from 'react';

interface SaveButtonProps {
  data: Uint8Array | undefined;
  filename: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ data, filename }) => {
  const handleSave = () => {
    if(!data) return;
    // Create a blob from the Uint8Array
    const blob = new Blob([data], { type: 'application/octet-stream' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.ifc') ? filename : `${filename}.ifc`;

    // Append the anchor to the body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    window.URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleSave}>
      Save IFC File
    </button>
  );
};

export default SaveButton;