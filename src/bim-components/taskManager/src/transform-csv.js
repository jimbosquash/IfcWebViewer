// Helper function to create a TableGroupData object
// This function takes a row of data and an array of keys, and maps each key to the corresponding value in the row.
// It returns an object with two properties: 'data' (which holds the key-value pairs) and 'children' (an empty array that will later hold child nodes).
function createTableGroupData(row, keys) {
  const data = {};

  // Iterate over the keys array, mapping each key to the corresponding value in the row.
  for (let i = 0; i < keys.length; i++) {
    data[keys[i]] = row[i];
  }

  // Return the data object and an empty children array.
  return { data, children: [] };
}

// Helper function to find a parent node by ID
// This recursive function searches through the tree structure, starting from the 'root' node, to find a node with a matching ID.
// It returns the node if found, or null if not found.
function findParentNode(root, parentId) {
  // Check if the current node's ID matches the parentId.
  if (root.data.ID === parentId) return root;

  // If the current node has children, recursively search each child.
  if (root.children) {
    for (const child of root.children) {
      const found = findParentNode(child, parentId);
      if (found) return found; // Return the found node if a match is found.
    }
  }

  // If no match is found, return null.
  return null;
}

// Function to remove empty children arrays
// This recursive function cleans up the tree by removing 'children' properties that are empty arrays.
function cleanUpEmptyChildren(node) {
  // If the node has a 'children' array but it is empty, delete the 'children' property.
  if (node.children && node.children.length === 0) {
    delete node.children;
  }
  // If the node has non-empty children, recursively apply the function to each child.
  else if (node.children) {
    for (const child of node.children) {
      cleanUpEmptyChildren(child);
    }
  }
}

// Main function to transform CSV data into a hierarchical structure
// This function takes raw CSV data and a delimiter (default is comma), and returns a tree-like structure.
export const transformCsv = (rawData, delimiter = ",") => {
  // Split the raw CSV data by line breaks, filter out any empty lines, and split each line by the delimiter.
  const data = rawData
    .split("\n")
    .filter((v) => v !== "")
    .map((row) => row.split(delimiter));

    // console.log("split 1", data)

  // Extract the keys (header row) and the rest of the rows.
  const [keys, ...rows] = data;

  console.log("keys", keys)
  console.log("rows", ...rows)


  // Initialize the result as an empty array to hold the root nodes of the tree structure.
  const result = [];

  // Iterate through each row of the CSV data.
  for (const row of rows) {
    // Split the first column (assumed to be an ID) by dots to identify hierarchy levels.
    const idParts = row[0].split(".");

    // Determine the parent ID by joining all but the last part of the ID.
    const parentId = idParts.slice(0, -1).join(".");

    // Create a node object for the current row using the helper function.
    const node = createTableGroupData(row, keys);

    // If there is no parentId (i.e., this is a root node), add the node directly to the result array.
    if (parentId === "") {
      result.push(node);
    }
    // Otherwise, search for the parent node within the current tree structure.
    else {
      let parentFound = false;

      // Iterate through the root nodes in the result array to find the parent.
      for (const root of result) {
        const parent = findParentNode(root, parentId);
        if (parent) {
          // If the parent is found, add the current node as a child of the parent.
          parent.children.push(node);
          parentFound = true;
          break;
        }
      }

      // If no parent was found, add the node to the root level (could be handled differently based on requirements).
      if (!parentFound) {
        result.push(node);
      }
    }
  }

  // Clean up the result tree by removing any empty children arrays.
  for (const node of result) {
    cleanUpEmptyChildren(node);
  }

  // Return the final hierarchical structure.
  return result;
};
