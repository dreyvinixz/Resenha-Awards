import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

export async function createBallotStore({ databaseUrl, dataDir }) {
  if (databaseUrl) {
    const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 10000 });
    await pool.query('CREATE TABLE IF NOT EXISTS ballots (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
    return {
      async save({ id, voterHash, selections, updatedAt, allowEdits }) {
        const existing = await pool.query('SELECT id FROM ballots WHERE voter_hash=$1', [voterHash]);
        const sql = allowEdits
          ? 'INSERT INTO ballots (id,voter_hash,selections,updated_at) VALUES ($1,$2,$3,$4) ON CONFLICT (voter_hash) DO UPDATE SET selections=EXCLUDED.selections,updated_at=EXCLUDED.updated_at RETURNING id'
          : 'INSERT INTO ballots (id,voter_hash,selections,updated_at) VALUES ($1,$2,$3,$4) ON CONFLICT (voter_hash) DO NOTHING RETURNING id';
        const result = await pool.query(sql, [id,voterHash,selections,updatedAt]);
        return result.rowCount ? { id: result.rows[0].id, updated: existing.rowCount > 0 } : null;
      },
      async list() { return (await pool.query('SELECT id,selections,updated_at FROM ballots ORDER BY updated_at DESC')).rows; },
      async close() { await pool.end(); },
    };
  }
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'votacao.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS ballots (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
  return {
    async save({ id, voterHash, selections, updatedAt, allowEdits }) {
      const existing=db.prepare('SELECT id FROM ballots WHERE voter_hash=?').get(voterHash);
      if (existing && !allowEdits) return null;
      if (existing) db.prepare('UPDATE ballots SET selections=?,updated_at=? WHERE voter_hash=?').run(selections,updatedAt,voterHash);
      else db.prepare('INSERT INTO ballots (id,voter_hash,selections,updated_at) VALUES (?,?,?,?)').run(id,voterHash,selections,updatedAt);
      return {id:existing?.id || id, updated:!!existing};
    },
    async list() { return db.prepare('SELECT id,selections,updated_at FROM ballots ORDER BY updated_at DESC').all(); },
    async close() { db.close(); },
  };
}
