export class Formatter {
  public static format(rawCode: string): string {
    const lines = rawCode.split('\n');
    const formatted: string[] = [];
    let indentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        // Prevent excessive consecutive blank lines
        if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
          formatted.push('');
        }
        continue;
      }

      if (line.startsWith('}') || line.startsWith('};')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = '  '.repeat(indentLevel);
      formatted.push(`${indent}${line}`);

      if (line.endsWith('{') && !line.startsWith('//')) {
        indentLevel++;
      }
    }

    return formatted.join('\n');
  }
}
