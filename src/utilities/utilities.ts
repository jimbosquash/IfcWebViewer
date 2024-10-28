// Function to generate a random hex color code
export function generateRandomHexColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};