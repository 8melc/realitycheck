/**
 * Reality Check Markdown Service
 * 
 * Service für das Laden und Rendern von Markdown-Dateien
 * aus dem Reality Check-Codex für die Transparenz-Seite
 */

import { MarkdownContent } from '@/types/transparency';

// Cache für geladene Markdown-Inhalte
const markdownCache = new Map<string, string>();

/**
 * Lädt Markdown-Inhalt aus dem Public-Ordner
 */
export async function loadMarkdownContent(filename: string): Promise<string> {
  // Prüfe Cache zuerst
  if (markdownCache.has(filename)) {
    return markdownCache.get(filename)!;
  }

  try {
    // Lade Markdown-Datei aus dem Public-Ordner
    const response = await fetch(`/content/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }

    const content = await response.text();
    
    // Cache den Inhalt
    markdownCache.set(filename, content);
    
    return content;
  } catch (error) {
    console.error(`Error loading markdown file ${filename}:`, error);
    return `# Fehler beim Laden der Quelle\n\nDie Datei "${filename}" konnte nicht geladen werden.\n\nBitte versuche es später erneut.`;
  }
}

/**
 * Lädt spezifische Quellen-Dokumente für die KI-Quellen Kachel
 */
export async function loadSourcesContent(): Promise<MarkdownContent> {
  try {
    // Lade externe Versionen der Quellen-Dokumente
    const [sourcesContent, transparencyContent] = await Promise.all([
      loadMarkdownContent('Reality Check-Quellen-Extern.md'),
      loadMarkdownContent('Reality Check-Transparenz-Extern.md')
    ]);

    // Kombiniere die Inhalte
    const combinedContent = `${sourcesContent}

---

${transparencyContent}

---

**Letzte Aktualisierung:** ${new Date().toLocaleDateString('de-DE')}
`;

    return {
      content: combinedContent,
      metadata: {
        title: 'Reality Check Quellen & Transparenz',
        date: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error loading sources content:', error);
    return {
      content: `# Quellen nicht verfügbar\n\nDie Quellen-Dokumentation ist momentan nicht verfügbar. Bitte versuche es später erneut.`,
      metadata: {
        title: 'Reality Check Quellen & Transparenz'
      }
    };
  }
}

/**
 * Parst Frontmatter aus Markdown-Inhalt
 */
export function parseMarkdownMetadata(content: string): MarkdownContent['metadata'] {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {};
  }

  const frontmatter = match[1];
  const body = match[2];
  
  const metadata: MarkdownContent['metadata'] = {};
  
  // Einfaches Frontmatter-Parsing
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      metadata[key.trim() as keyof MarkdownContent['metadata']] = value;
    }
  });

  return {
    ...metadata,
    // Body ohne Frontmatter
    content: body
  };
}

/**
 * Bereinigt Cache (für Development)
 */
export function clearMarkdownCache(): void {
  markdownCache.clear();
}
