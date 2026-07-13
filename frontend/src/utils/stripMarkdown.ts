export function stripMarkdown(markdown: string): string {
  let text = markdown;
  text = text.replace(/```[a-zA-Z]*\n?/g, '');        // remove ```markdown fences
  text = text.replace(/```/g, '');                     // remove closing ```
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^[\s]*[-*+]\s+/gm, '• ');
  text = text.replace(/^\s*([-*_]){3,}\s*$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}