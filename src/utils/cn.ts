/**
 * Utility function for merging Tailwind CSS classes.
 * Uses a simple approach to merge class names, handling conflicts.
 */

type ClassValue = string | undefined | null | false | ClassValue[];

function flattenClasses(classes: ClassValue[]): string[] {
  const result: string[] = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (Array.isArray(cls)) {
      result.push(...flattenClasses(cls));
    } else {
      result.push(...cls.split(' ').filter(Boolean));
    }
  }
  return result;
}

/**
 * Merges class names, with later classes taking precedence.
 * Handles Tailwind CSS class conflicts by keeping the last occurrence.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes = flattenClasses(inputs);
  
  // Simple deduplication - keeps last occurrence of each class
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (let i = classes.length - 1; i >= 0; i--) {
    const cls = classes[i];
    if (!seen.has(cls)) {
      seen.add(cls);
      result.unshift(cls);
    }
  }
  
  return result.join(' ');
}

export default cn;
