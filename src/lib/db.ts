import path from 'path';
import fs from 'fs/promises';

export interface VectorRecord {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface ChatThread {
  id: string;
  title: string;
  created_at: string;
  messages: any[]; // JSON szerializált üzenetek (Message interfész alapján)
}

export interface VectorDatabase {
  documents: VectorRecord[];
  memories: VectorRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DOCS_FILE = path.join(DB_DIR, 'documents.json');
const MEMORIES_FILE = path.join(DB_DIR, 'memories.json');
const THREADS_FILE = path.join(DB_DIR, 'threads.json');

class FileVectorDB {
  public documents: VectorRecord[] = [];
  public memories: VectorRecord[] = [];
  public threads: ChatThread[] = [];
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      this.documents = await this.loadTable<VectorRecord>(DOCS_FILE);
      this.memories = await this.loadTable<VectorRecord>(MEMORIES_FILE);
      this.threads = await this.loadTable<ChatThread>(THREADS_FILE);
      this.initialized = true;
      console.log('✅ File adatbázis inicializálva a data/ mappában.');
    } catch (error) {
      console.error('Hiba a DB inicializálásakor:', error);
    }
  }

  private async loadTable<T>(filepath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (err: unknown) {
      if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        // Create empty file if not exists
        await fs.writeFile(filepath, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  }

  private async saveTable(filepath: string, data: any[]): Promise<void> {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- VectorRecord Lekérdezések ---
  async getTable(table: 'documents' | 'memories'): Promise<VectorRecord[]> {
    return table === 'documents' ? this.documents : this.memories;
  }

  async addRecord(table: 'documents' | 'memories', record: VectorRecord): Promise<void> {
    if (table === 'documents') {
      const index = this.documents.findIndex(d => d.id === record.id);
      if (index >= 0) this.documents[index] = record;
      else this.documents.push(record);
      await this.saveTable(DOCS_FILE, this.documents);
    } else {
      const index = this.memories.findIndex(d => d.id === record.id);
      if (index >= 0) this.memories[index] = record;
      else this.memories.push(record);
      await this.saveTable(MEMORIES_FILE, this.memories);
    }
  }

  async deleteRecord(table: 'documents' | 'memories', id: string): Promise<void> {
    if (table === 'documents') {
      this.documents = this.documents.filter(d => d.id !== id);
      await this.saveTable(DOCS_FILE, this.documents);
    } else {
      this.memories = this.memories.filter(d => d.id !== id);
      await this.saveTable(MEMORIES_FILE, this.memories);
    }
  }

  async getMemories() {
    return this.memories;
  }

  async search(queryEmbedding: number[], table: 'documents' | 'memories', topK = 3): Promise<(VectorRecord & { score: number })[]> {
    const records = await this.getTable(table);
    if (records.length === 0) return [];

    const similarities = records.map(record => ({
      ...record,
      score: this.cosineSimilarity(queryEmbedding, record.embedding)
    }));

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // --- Beszélgetés Szálak (Chat History) Kezelése ---
  async saveThread(id: string, title: string, messages: any[]): Promise<void> {
    const now = new Date().toISOString();
    const index = this.threads.findIndex(t => t.id === id);
    const newThread = { id, title, created_at: now, messages };
    
    if (index >= 0) {
      this.threads[index] = { ...this.threads[index], title, messages }; // Ne frissítsük a created_at-et ha már létezik
    } else {
      this.threads.unshift(newThread); // Legújabb kerül előre
    }
    await this.saveTable(THREADS_FILE, this.threads);
  }

  async getThreads(): Promise<{ id: string; title: string; created_at: string }[]> {
    return this.threads.map(t => ({ id: t.id, title: t.title, created_at: t.created_at }));
  }

  async getThread(id: string): Promise<ChatThread | null> {
    return this.threads.find(t => t.id === id) || null;
  }

  async deleteThread(id: string): Promise<void> {
    this.threads = this.threads.filter(t => t.id !== id);
    await this.saveTable(THREADS_FILE, this.threads);
  }
}

export const db = new FileVectorDB();
