import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');

export const inject = ['webServer', 'workspaceRegistry', 'sessionProjectionCache', 'sessions'];

export function apply(ctx) {
  ctx.logger?.info?.('dsh-project-deck: host initialized');

  if (ctx.webServer && typeof ctx.webServer.register === 'function') {
    // Note: Do NOT use /api/ prefix to avoid DSH API gateway authentication interception
    ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-project-deck/delete-session',
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST' });
          return res.end();
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const sessionId = parsed.sessionId;
            if (!sessionId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'sessionId is required' }));
            }

            ctx.logger?.info?.(`dsh-project-deck: permanently deleting session "${sessionId}"`);

            // 1. In-memory update: workspaceRegistry & storageDomain
            try {
              const registry = ctx.get('workspaceRegistry') || ctx.workspaceRegistry;
              if (registry) {
                registry.headers?.delete?.(sessionId);
                registry.sessionPaths?.delete?.(sessionId);
                registry.missingSessionPaths?.delete?.(sessionId);

                // Update in-memory entities map
                if (registry.entities) {
                  for (const entity of registry.entities.values()) {
                    if (entity && entity.record && Array.isArray(entity.record.sessionIds)) {
                      entity.record.sessionIds = entity.record.sessionIds.filter((id) => id !== sessionId);
                    }
                  }
                }

                // Update domain table
                if (typeof registry.requireTable === 'function') {
                  try {
                    const table = registry.requireTable();
                    const state = typeof registry.requireState === 'function' ? registry.requireState() : {};
                    const wsIds = state.workspaceIds || (registry.entities ? [...registry.entities.keys()] : []);
                    for (const wId of wsIds) {
                      const row = table.get?.(wId);
                      if (row && Array.isArray(row.sessionIds) && row.sessionIds.includes(sessionId)) {
                        const next = await table.update?.(wId, (curr) => ({
                          ...curr,
                          sessionIds: curr.sessionIds.filter((id) => id !== sessionId),
                          updatedAt: new Date().toISOString()
                        }));
                        const entity = registry.entities?.get?.(wId);
                        if (entity && next) {
                          entity.record = next;
                        }
                      }
                    }
                  } catch (e) {
                    ctx.logger?.warn?.(`dsh-project-deck: table update failed: ${e.message}`);
                  }
                }

                if (registry.state && Array.isArray(registry.state.archivedSessionIds)) {
                  registry.state.archivedSessionIds = registry.state.archivedSessionIds.filter((id) => id !== sessionId);
                }
                if (registry.deletedSessionIds && typeof registry.deletedSessionIds.add === 'function') {
                  registry.deletedSessionIds.add(sessionId);
                }
              }
            } catch (err) {
              ctx.logger?.warn?.(`dsh-project-deck: in-memory registry purge error: ${err.message}`);
            }

            // 2. Clean from storages/workspace.json on disk
            const wsJsonPath = path.join(DSH_HOME, 'storages', 'workspace.json');
            if (fs.existsSync(wsJsonPath)) {
              try {
                const wsData = JSON.parse(fs.readFileSync(wsJsonPath, 'utf8'));
                let modified = false;

                if (wsData.tables && wsData.tables.workspaces) {
                  for (const ws of Object.values(wsData.tables.workspaces)) {
                    if (Array.isArray(ws.sessionIds) && ws.sessionIds.includes(sessionId)) {
                      ws.sessionIds = ws.sessionIds.filter((id) => id !== sessionId);
                      modified = true;
                    }
                  }
                }

                if (wsData.global) {
                  if (Array.isArray(wsData.global.archivedSessionIds) && wsData.global.archivedSessionIds.includes(sessionId)) {
                    wsData.global.archivedSessionIds = wsData.global.archivedSessionIds.filter((id) => id !== sessionId);
                    modified = true;
                  }
                  if (Array.isArray(wsData.global.pinnedSessionIds) && wsData.global.pinnedSessionIds.includes(sessionId)) {
                    wsData.global.pinnedSessionIds = wsData.global.pinnedSessionIds.filter((id) => id !== sessionId);
                    modified = true;
                  }
                }

                if (modified) {
                  fs.writeFileSync(wsJsonPath, JSON.stringify(wsData, null, 2), 'utf8');
                }
              } catch (e) {
                ctx.logger?.warn?.(`dsh-project-deck: workspace.json cleanup error: ${e.message}`);
              }
            }

            // 3. Remove session transcript folder in ~/.dsh/sessions/*/{sessionId}
            const sessionsDir = path.join(DSH_HOME, 'sessions');
            if (fs.existsSync(sessionsDir)) {
              try {
                const wsDirs = fs.readdirSync(sessionsDir, { withFileTypes: true });
                for (const d of wsDirs) {
                  if (d.isDirectory()) {
                    const sessionFolder = path.join(sessionsDir, d.name, sessionId);
                    if (fs.existsSync(sessionFolder)) {
                      fs.rmSync(sessionFolder, { recursive: true, force: true });
                    }
                  }
                }
              } catch (e) {
                ctx.logger?.warn?.(`dsh-project-deck: transcript deletion error: ${e.message}`);
              }
            }

            // 4. Remove projection cache files
            const projDirs = [
              path.join(DSH_HOME, 'storages', 'session_projcache', 'sessions'),
              path.join(DSH_HOME, 'storages', 'session_projcache_archive_manager_v2', 'sessions')
            ];
            for (const dir of projDirs) {
              if (fs.existsSync(dir)) {
                const cacheFile = path.join(dir, `${sessionId}.json`);
                if (fs.existsSync(cacheFile)) {
                  try {
                    fs.unlinkSync(cacheFile);
                  } catch {}
                }
              }
            }

            // 5. Detach from live session runtime if memory-loaded
            try {
              const sessions = ctx.get('sessions') || ctx.sessions;
              if (sessions && typeof sessions.get === 'function') {
                const live = sessions.get(sessionId);
                if (live !== undefined && typeof sessions.liveEntryFor === 'function') {
                  const entry = sessions.liveEntryFor(live);
                  if (entry && typeof sessions.detachEntered === 'function') {
                    sessions.detachEntered(entry);
                  }
                }
              }
            } catch {}

            // 6. Delete projection cache in-memory if available
            try {
              const projCache = ctx.get('sessionProjectionCache') || ctx.sessionProjectionCache;
              if (projCache && typeof projCache.delete === 'function') {
                await projCache.delete(sessionId);
              }
            } catch {}

            // 7. Emit removal notification across DSH
            try {
              ctx.emit?.('api-session/removed', sessionId);
            } catch {}

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, deleted: true }));
          } catch (err) {
            ctx.logger?.error?.(`dsh-project-deck: delete failed: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
    });
  }
}

export default {
  apply,
  inject
};
