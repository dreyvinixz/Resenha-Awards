import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

export async function createBallotStore({ databaseUrl, dataDir }) {
  if (databaseUrl) {
    const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 10000 });
    pool.on('error', () => console.error('A conexão ociosa com o banco foi encerrada.'));
    await pool.query('CREATE TABLE IF NOT EXISTS ballots (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
    await pool.query('CREATE TABLE IF NOT EXISTS nominations (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
    await pool.query('CREATE TABLE IF NOT EXISTS category_nominations (id TEXT PRIMARY KEY, voter_hash TEXT NOT NULL, category TEXT NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(voter_hash,category))');
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
      async saveNominations({id,voterHash,selections,updatedAt,allowEdits}) {
        const sql = allowEdits
          ? 'INSERT INTO nominations (id,voter_hash,selections,updated_at) VALUES ($1,$2,$3,$4) ON CONFLICT (voter_hash) DO UPDATE SET selections=EXCLUDED.selections,updated_at=EXCLUDED.updated_at RETURNING id'
          : 'INSERT INTO nominations (id,voter_hash,selections,updated_at) VALUES ($1,$2,$3,$4) ON CONFLICT (voter_hash) DO NOTHING RETURNING id';
        const result=await pool.query(sql,[id,voterHash,selections,updatedAt]);
        return result.rowCount ? {id:result.rows[0].id} : null;
      },
      async saveCategory({id,voterHash,category,selections,updatedAt}) { const r=await pool.query('INSERT INTO category_nominations (id,voter_hash,category,selections,updated_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (voter_hash,category) DO NOTHING RETURNING id',[id,voterHash,category,selections,updatedAt]); return r.rowCount>0; },
      async getCategory(voterHash,category) {const r=await pool.query('SELECT selections FROM category_nominations WHERE voter_hash=$1 AND category=$2',[voterHash,category]);return r.rows[0]?.selections || (category==='Jack do Ano'?await this.getJack(voterHash):null);},
      async updateCategory(voterHash,category,selections,updatedAt) {const r=await pool.query('UPDATE category_nominations SET selections=$3,updated_at=$4 WHERE voter_hash=$1 AND category=$2 RETURNING id',[voterHash,category,selections,updatedAt]);return r.rowCount>0 || (category==='Jack do Ano' && await this.updateJack(voterHash,selections,updatedAt));},
      async getJack(voterHash) {const r=await pool.query("SELECT selections FROM category_nominations WHERE voter_hash=$1 AND category='Jack do Ano' UNION ALL SELECT selections FROM nominations WHERE voter_hash=$1 LIMIT 1",[voterHash]);return r.rows[0]?.selections||null;},
      async updateJack(voterHash,selections,updatedAt) {const r=await pool.query("UPDATE category_nominations SET selections=$2,updated_at=$3 WHERE voter_hash=$1 AND category='Jack do Ano' RETURNING id",[voterHash,selections,updatedAt]);if(r.rowCount)return true;return (await pool.query('UPDATE nominations SET selections=$2,updated_at=$3 WHERE voter_hash=$1 RETURNING id',[voterHash,selections,updatedAt])).rowCount>0;},
      async categoryStatus(voterHash) {const rows=(await pool.query("SELECT category FROM category_nominations WHERE voter_hash=$1 UNION SELECT 'Jack do Ano' AS category FROM nominations WHERE voter_hash=$1",[voterHash])).rows; return rows.map(r=>r.category);},
      async listNominations() { return (await pool.query('SELECT id,selections,updated_at FROM nominations UNION ALL SELECT id,selections,updated_at FROM category_nominations ORDER BY updated_at DESC')).rows; },
      async close() { await pool.end(); },
    };
  }
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'votacao.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS ballots (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
  db.exec('CREATE TABLE IF NOT EXISTS nominations (id TEXT PRIMARY KEY, voter_hash TEXT UNIQUE NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL)');
  db.exec('CREATE TABLE IF NOT EXISTS category_nominations (id TEXT PRIMARY KEY, voter_hash TEXT NOT NULL, category TEXT NOT NULL, selections TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(voter_hash,category))');
  return {
    async save({ id, voterHash, selections, updatedAt, allowEdits }) {
      const existing=db.prepare('SELECT id FROM ballots WHERE voter_hash=?').get(voterHash);
      if (existing && !allowEdits) return null;
      if (existing) db.prepare('UPDATE ballots SET selections=?,updated_at=? WHERE voter_hash=?').run(selections,updatedAt,voterHash);
      else db.prepare('INSERT INTO ballots (id,voter_hash,selections,updated_at) VALUES (?,?,?,?)').run(id,voterHash,selections,updatedAt);
      return {id:existing?.id || id, updated:!!existing};
    },
    async list() { return db.prepare('SELECT id,selections,updated_at FROM ballots ORDER BY updated_at DESC').all(); },
    async saveNominations({id,voterHash,selections,updatedAt,allowEdits}) {
      const existing=db.prepare('SELECT id FROM nominations WHERE voter_hash=?').get(voterHash);
      if(existing && !allowEdits) return null;
      if(existing) db.prepare('UPDATE nominations SET selections=?,updated_at=? WHERE voter_hash=?').run(selections,updatedAt,voterHash);
      else db.prepare('INSERT INTO nominations (id,voter_hash,selections,updated_at) VALUES (?,?,?,?)').run(id,voterHash,selections,updatedAt);
      return {id:existing?.id||id};
    },
    async saveCategory({id,voterHash,category,selections,updatedAt}) {return db.prepare('INSERT INTO category_nominations (id,voter_hash,category,selections,updated_at) VALUES (?,?,?,?,?) ON CONFLICT (voter_hash,category) DO NOTHING').run(id,voterHash,category,selections,updatedAt).changes>0;},
    async getCategory(voterHash,category) {return db.prepare('SELECT selections FROM category_nominations WHERE voter_hash=? AND category=?').get(voterHash,category)?.selections || (category==='Jack do Ano'?await this.getJack(voterHash):null);},
    async updateCategory(voterHash,category,selections,updatedAt) {const r=db.prepare('UPDATE category_nominations SET selections=?,updated_at=? WHERE voter_hash=? AND category=?').run(selections,updatedAt,voterHash,category);return r.changes>0 || (category==='Jack do Ano' && await this.updateJack(voterHash,selections,updatedAt));},
    async getJack(voterHash) {return db.prepare("SELECT selections FROM category_nominations WHERE voter_hash=? AND category='Jack do Ano' UNION ALL SELECT selections FROM nominations WHERE voter_hash=? LIMIT 1").get(voterHash,voterHash)?.selections||null;},
    async updateJack(voterHash,selections,updatedAt) {const r=db.prepare("UPDATE category_nominations SET selections=?,updated_at=? WHERE voter_hash=? AND category='Jack do Ano'").run(selections,updatedAt,voterHash);if(r.changes)return true;return db.prepare('UPDATE nominations SET selections=?,updated_at=? WHERE voter_hash=?').run(selections,updatedAt,voterHash).changes>0;},
    async categoryStatus(voterHash) {return db.prepare("SELECT category FROM category_nominations WHERE voter_hash=? UNION SELECT 'Jack do Ano' AS category FROM nominations WHERE voter_hash=?").all(voterHash,voterHash).map(r=>r.category);},
    async listNominations() { return db.prepare('SELECT id,selections,updated_at FROM nominations UNION ALL SELECT id,selections,updated_at FROM category_nominations ORDER BY updated_at DESC').all(); },
    async close() { db.close(); },
  };
}
