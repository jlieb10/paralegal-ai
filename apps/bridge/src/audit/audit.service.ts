import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuditLogEntryT } from '@paralegal-ai/schemas';

@Injectable()
export class AuditService {
  private entries: AuditLogEntryT[] = [];
  private lastHash: string = '0000000000000000'; // Genesis hash

  async logBridgeQuery(
    requesterService: string,
    templateId: string,
    placeholders: Record<string, string>,
    modelId: string,
    result: string
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const id = this.generateId();
    
    // Hash the placeholders
    const placeholdersHash = this.hashObject(placeholders);
    const resultHash = this.hashString(result);
    
    // Create new entry
    const entry: AuditLogEntryT = {
      id,
      timestamp,
      requester_service: requesterService,
      template_id: templateId,
      placeholders_hash: placeholdersHash,
      model_id: modelId,
      result_hash: resultHash,
      previous_hash: this.lastHash
    };

    // Add to chain
    this.entries.push(entry);
    
    // Update chain hash
    const entryHash = this.hashObject(entry);
    this.lastHash = entryHash;

    // In production, this would persist to database
    console.log('[AUDIT]', JSON.stringify(entry));

    return id;
  }

  async getMerkleRoot(): Promise<string> {
    if (this.entries.length === 0) {
      return this.lastHash;
    }

    // Simple merkle root calculation
    const hashes = this.entries.map(entry => this.hashObject(entry));
    return this.calculateMerkleRoot(hashes);
  }

  async validateChain(): Promise<boolean> {
    for (let i = 1; i < this.entries.length; i++) {
      const currentEntry = this.entries[i];
      const previousEntry = this.entries[i - 1];
      const expectedPreviousHash = this.hashObject(previousEntry);

      if (currentEntry.previous_hash !== expectedPreviousHash) {
        return false;
      }
    }
    return true;
  }

  async getEntries(limit?: number): Promise<AuditLogEntryT[]> {
    const entries = this.entries.slice();
    if (limit) {
      return entries.slice(-limit);
    }
    return entries;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private hashString(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.hashString(str);
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return this.lastHash;
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left; // Duplicate if odd number
      const combined = this.hashString(left + right);
      nextLevel.push(combined);
    }

    return this.calculateMerkleRoot(nextLevel);
  }
}