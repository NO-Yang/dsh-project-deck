/**
 * dsh-project-deck 
 * Modern Project Deck & Workspace Organizer for DeepSeek Harness (DSH)
 * 
 * Features:
 * 1. Native typography & style alignment (font-family: inherit, light/dark mode auto-adaptive)
 * 2. Reliable session deletion (memory detach + disk & workspace.json cleanup + persistent purge)
 * 3. Session archive & restore
 * 4. Project folder grouping with workspace isolation
 * 5. One-click toggle between Project Deck and Native DSH Workspace Browser
 */

window.__ModuleLoader__.load({
  id: 'dsh-project-deck',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    const React = require('react');
    const h = React.createElement;

    const PLUGIN_ID = 'dsh-project-deck';
    const GROUPS_STORAGE_KEY = 'dsh.project_deck.groups.v1';
    const VIEW_STATE_KEY = 'dsh.project_deck.view_state.v1';
    const DELETED_STORAGE_KEY = 'dsh.project_deck.deleted_sessions.v1';
    const STYLE_ID = 'dsh-project-deck/styles';

    // SVG Icons
    const PATHS = {
      folder: 'M2.2 4.6A1.6 1.6 0 0 1 3.8 3h2.1l1.3 1.7h5A1.6 1.6 0 0 1 13.8 6.3v5.1A1.6 1.6 0 0 1 12.2 13H3.8A1.6 1.6 0 0 1 2.2 11.4z',
      folderOpen: 'M2.2 4.6A1.6 1.6 0 0 1 3.8 3h2.1l1.3 1.7h5A1.6 1.6 0 0 1 13.8 6.3v1H4.2l-1.5 5.5v-7.2zm2 3.4h9.6l-1.4 5H2.8z',
      workspace: 'M8 2.2 14 5.5 8 8.8 2 5.5zM2 9l6 3.3L14 9M2 12.2 8 15.5l6-3.3',
      chat: 'M13.6 8.1c0 2.6-2.5 4.7-5.6 4.7-.7 0-1.4-.1-2-.3L2.9 14l1-2.5C3.2 10.7 2.9 9.5 2.9 8.1 2.9 5.5 5.4 3.4 8 3.4s5.6 2.1 5.6 4.7z',
      archive: 'M2 4h12v3H2zm1 3h10v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm4 2h2v1H7z',
      unarchive: 'M6 9l-3-3 3-3M3 6h8a3 3 0 0 1 3 3v4',
      trash: 'M3 4h10M6 4V2.5h4V4M4.5 4l.8 9.5a1 1 0 0 0 1 .9h3.4a1 1 0 0 0 1-.9L11.5 4',
      plus: 'M8 3v10M3 8h10',
      chevron: 'M6 3.5 10.5 8 6 12.5',
      list: 'M3 4.2h10M3 8h10M3 11.8h10',
      close: 'M4 4l8 8M12 4l-8 8'
    };

    function Icon(props) {
      const size = props.size || 14;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          'aria-hidden': 'true',
          style: {
            display: 'inline-block',
            flexShrink: 0,
            verticalAlign: 'middle',
            transition: 'transform 0.15s ease'
          }
        },
        h('path', {
          d: PATHS[props.name] || '',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: props.name === 'chevron' ? 1.6 : 1.35,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        })
      );
    }

    // Adaptive CSS (Identical Native Typography and Theme Alignment)
    const ADAPTIVE_CSS = `
      .dpd-root {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: transparent;
        color: inherit;
        font-family: inherit;
        font-size: 13.5px;
        line-height: 1.5;
        user-select: none;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
      }
      
      .dpd-scroll {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0 4px 10px;
      }
      .dpd-scroll::-webkit-scrollbar { width: 4px; }
      .dpd-scroll::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, currentColor 14%, transparent);
        border-radius: 4px;
      }
      
      .dpd-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        min-height: 34px;
        margin-bottom: 4px;
        border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
      }
      .dpd-header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.65;
      }
      .dpd-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .dpd-btn-head {
        background: transparent;
        border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
        border-radius: 5px;
        color: inherit;
        font-family: inherit;
        font-size: 11.5px;
        padding: 3px 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        opacity: 0.8;
        transition: all 0.15s ease;
      }
      .dpd-btn-head:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 8%, transparent);
        border-color: color-mix(in srgb, currentColor 24%, transparent);
      }
      
      .dpd-group-block { margin-top: 4px; margin-bottom: 4px; }
      
      .dpd-row {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 30px;
        padding: 2px 8px;
        border-radius: 6px;
        cursor: pointer;
        color: inherit;
        font-family: inherit;
        transition: background 0.12s ease;
      }
      .dpd-row:hover {
        background: color-mix(in srgb, currentColor 7%, transparent);
      }
      .dpd-row:hover .dpd-hover-actions {
        opacity: 1;
      }
      
      .dpd-group-row {
        font-weight: 500;
        font-size: 13.5px;
        min-height: 32px;
        opacity: 0.88;
      }
      .dpd-group-row:hover {
        opacity: 1;
      }
      
      .dpd-ws-box {
        margin-left: 8px;
        padding-left: 6px;
        border-left: 1px solid color-mix(in srgb, currentColor 10%, transparent);
      }
      .dpd-ws-row {
        font-weight: 500;
        font-size: 13.5px;
        min-height: 32px;
      }
      
      .dpd-sess-box {
        margin-left: 10px;
        padding-left: 8px;
        border-left: 1px solid color-mix(in srgb, currentColor 12%, transparent);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .dpd-sess-row {
        font-weight: 400;
        font-size: 13.5px;
        opacity: 0.88;
        min-height: 30px;
        padding: 2px 8px;
      }
      .dpd-sess-row:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 8%, transparent);
      }
      .dpd-sess-row.archived {
        opacity: 0.52;
      }
      .dpd-sess-row.archived:hover {
        opacity: 0.88;
      }
      
      .dpd-label {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13.5px;
        line-height: 20px;
      }
      
      .dpd-badge {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: color-mix(in srgb, currentColor 8%, transparent);
        opacity: 0.65;
        font-variant-numeric: tabular-nums;
        font-weight: normal;
        line-height: 16px;
      }
      
      .dpd-hover-actions {
        display: flex;
        align-items: center;
        gap: 3px;
        opacity: 0;
        transition: opacity 0.12s ease;
      }
      
      .dpd-icon-btn {
        background: transparent;
        border: none;
        color: inherit;
        padding: 3px;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0.65;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.12s ease;
      }
      .dpd-icon-btn:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 12%, transparent);
      }
      .dpd-icon-btn.danger:hover {
        background: color-mix(in srgb, #ef4444 20%, transparent);
        color: #ef4444;
        opacity: 1;
      }
      
      .dpd-chevron-icon {
        transition: transform 0.15s ease;
        display: inline-flex;
        align-items: center;
      }
      .dpd-chevron-open {
        transform: rotate(90deg);
      }
      
      .dpd-pulse-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 6px #10b981;
        flex-shrink: 0;
        animation: dpd-pulse 1.2s ease-in-out infinite;
      }
      @keyframes dpd-pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      
      .dpd-archive-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        margin: 2px 0;
        font-size: 12px;
        min-height: 26px;
        opacity: 0.6;
        cursor: pointer;
        border-radius: 4px;
      }
      .dpd-archive-toggle:hover {
        opacity: 0.95;
        background: color-mix(in srgb, currentColor 6%, transparent);
      }
      
      .dpd-select-move {
        background: color-mix(in srgb, currentColor 6%, transparent);
        border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
        color: inherit;
        font-family: inherit;
        border-radius: 4px;
        font-size: 11px;
        padding: 2px 4px;
        outline: none;
        max-width: 80px;
      }
      .dpd-select-move option {
        background: #fff;
        color: #111;
      }
      
      .dpd-modal-mask {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .dpd-modal-card {
        background: var(--dsh-alias-bg-layer-2, #ffffff);
        color: var(--dsh-alias-label-primary, inherit);
        font-family: inherit;
        border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
        border-radius: 10px;
        padding: 18px 20px;
        width: 300px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      }
      .dpd-modal-title {
        font-size: 14.5px;
        font-weight: 500;
        margin: 0 0 10px;
      }
      .dpd-modal-desc {
        font-size: 13px;
        opacity: 0.75;
        margin: 0 0 16px;
        line-height: 1.5;
      }
      .dpd-modal-input {
        width: 100%;
        background: color-mix(in srgb, currentColor 5%, transparent);
        border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
        border-radius: 6px;
        color: inherit;
        font-family: inherit;
        padding: 8px 10px;
        margin-bottom: 16px;
        box-sizing: border-box;
        outline: none;
        font-size: 13.5px;
      }
      .dpd-modal-input:focus {
        border-color: #3b82f6;
      }
      .dpd-modal-btns {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .dpd-btn {
        padding: 6px 14px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 500;
      }
      .dpd-btn.primary { background: #2563eb; color: #fff; }
      .dpd-btn.danger { background: #dc2626; color: #fff; }
      .dpd-btn.cancel {
        background: color-mix(in srgb, currentColor 10%, transparent);
        color: inherit;
      }
      
      .dpd-foot-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 5px;
        border: none;
        background: transparent;
        color: inherit;
        font-family: inherit;
        opacity: 0.7;
        cursor: pointer;
        font-size: 12.5px;
      }
      .dpd-foot-toggle:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 8%, transparent);
      }
    `;

    function ensureStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = ADAPTIVE_CSS;
      document.head.appendChild(el);
    }

    // View State (tree vs native)
    let viewStateListeners = new Set();
    function getViewState() {
      try {
        const raw = localStorage.getItem(VIEW_STATE_KEY);
        return raw ? JSON.parse(raw) : { mode: 'tree' };
      } catch {
        return { mode: 'tree' };
      }
    }
    function updateViewState(patch) {
      const current = getViewState();
      const next = Object.assign({}, current, patch);
      try {
        localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(next));
      } catch {}
      viewStateListeners.forEach((fn) => fn(next));
    }
    function subscribeViewState(fn) {
      viewStateListeners.add(fn);
      return () => viewStateListeners.delete(fn);
    }
    function useViewState() {
      const [state, setState] = React.useState(getViewState);
      React.useEffect(() => subscribeViewState(setState), []);
      return state;
    }

    // Persistent Deleted Session IDs across view switches
    function getPersistentDeletedIds() {
      try {
        const raw = localStorage.getItem(DELETED_STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
      } catch {
        return new Set();
      }
    }
    function savePersistentDeletedId(sessionId) {
      const current = getPersistentDeletedIds();
      current.add(sessionId);
      try {
        localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify([...current]));
      } catch {}
    }

    // Cordis Store Snapshot Hook
    function useStoreSnapshot(store) {
      const subscribe = React.useCallback((listener) => {
        if (!store || typeof store.subscribe !== 'function') return () => {};
        return store.subscribe(listener);
      }, [store]);
      const getSnapshot = React.useCallback(() => {
        if (!store) return {};
        return typeof store.getSnapshot === 'function' ? store.getSnapshot() : store;
      }, [store]);
      return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    // Project Groups Data
    function loadGroups() {
      try {
        const item = localStorage.getItem(GROUPS_STORAGE_KEY);
        return item ? JSON.parse(item) : { groups: [] };
      } catch {
        return { groups: [] };
      }
    }
    function saveGroups(cfg) {
      try {
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(cfg));
      } catch {}
    }

    // Main Project Deck Tree View
    function ProjectDeckTree(props) {
      const {
        workspacesStore,
        sessionsStore,
        openSession,
        startSession,
        archiveSession,
        unarchiveSession,
        deleteSession
      } = props;

      const [config, setConfig] = React.useState(loadGroups);
      const [collapsedGroups, setCollapsedGroups] = React.useState({});
      const [collapsedWs, setCollapsedWs] = React.useState({});
      const [openArchives, setOpenArchives] = React.useState({});
      const [deletedSessionIds, setDeletedSessionIds] = React.useState(getPersistentDeletedIds);

      // Modals
      const [showNewGroup, setShowNewGroup] = React.useState(false);
      const [groupNameInput, setGroupNameInput] = React.useState('');
      const [deleteTarget, setDeleteTarget] = React.useState(null);

      // Reactive data snapshots from Cordis
      const workspaceSnapshot = useStoreSnapshot(workspacesStore);
      const sessionSnapshot = useStoreSnapshot(sessionsStore);

      const workspaces = workspaceSnapshot.items || [];
      const archivedIds = React.useMemo(() => new Set(workspaceSnapshot.archivedSessionIds || []), [workspaceSnapshot]);
      const sessionsMap = sessionSnapshot.byId || {};

      const save = (updated) => {
        setConfig(updated);
        saveGroups(updated);
      };

      const handleAddGroup = () => {
        if (!groupNameInput.trim()) return;
        const g = { id: 'grp_' + Date.now(), name: groupNameInput.trim(), workspaceIds: [] };
        save({ ...config, groups: [...(config.groups || []), g] });
        setGroupNameInput('');
        setShowNewGroup(false);
      };

      const handleRemoveGroup = (groupId, e) => {
        e.stopPropagation();
        save({ ...config, groups: (config.groups || []).filter(g => g.id !== groupId) });
      };

      const handleMoveWorkspace = (wId, targetGroupId) => {
        const next = (config.groups || []).map(g => {
          const list = (g.workspaceIds || []).filter(id => id !== wId);
          if (g.id === targetGroupId) return { ...g, workspaceIds: [...list, wId] };
          return { ...g, workspaceIds: list };
        });
        save({ ...config, groups: next });
      };

      const assignedWs = React.useMemo(() => {
        const map = new Map();
        (config.groups || []).forEach(g => {
          (g.workspaceIds || []).forEach(wId => map.set(wId, g.id));
        });
        return map;
      }, [config]);

      const uncategorized = React.useMemo(() => {
        return workspaces.filter(w => !assignedWs.has(w.workspaceId));
      }, [workspaces, assignedWs]);

      // Confirm Delete Handler with Instant Optimistic Removal + Persistent Retention
      const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const sId = deleteTarget.sessionId;
        
        // 1. Immediately remove from local UI and persist deleted id so it never returns
        setDeletedSessionIds(prev => new Set([...prev, sId]));
        savePersistentDeletedId(sId);
        setDeleteTarget(null);

        // 2. Perform backend deletion
        try {
          await deleteSession(sId);
        } catch (err) {
          console.error('deleteSession error:', err);
        }
      };

      // Render Session Item
      const renderSession = (sId, isArchived) => {
        if (deletedSessionIds.has(sId)) return null;

        const s = sessionsMap[sId];
        const title = s ? (s.displayTitle || s.title || '会话 ' + sId.slice(0, 8)) : '会话 ' + sId.slice(0, 8);
        const isRunning = s && s.running;

        return h(
          'div',
          {
            key: sId,
            className: `dpd-row dpd-sess-row ${isArchived ? 'archived' : ''}`,
            onClick: () => openSession(sId)
          },
          isRunning
            ? h('div', { className: 'dpd-pulse-dot', title: '运行中' })
            : h(Icon, { name: 'chat' }),
          h('span', { className: 'dpd-label', title }, title),
          h(
            'div',
            { className: 'dpd-hover-actions' },
            !isArchived ? h(
              'button',
              {
                className: 'dpd-icon-btn',
                title: '归档此会话',
                onClick: (e) => { e.stopPropagation(); archiveSession(sId); }
              },
              h(Icon, { name: 'archive' })
            ) : h(
              'button',
              {
                className: 'dpd-icon-btn',
                title: '恢复会话',
                onClick: (e) => { e.stopPropagation(); unarchiveSession(sId); }
              },
              h(Icon, { name: 'unarchive' })
            ),
            h(
              'button',
              {
                className: 'dpd-icon-btn danger',
                title: '彻底删除',
                onClick: (e) => {
                  e.stopPropagation();
                  setDeleteTarget({ sessionId: sId, title });
                }
              },
              h(Icon, { name: 'trash' })
            )
          )
        );
      };

      // Render Workspace Item
      const renderWorkspace = (w) => {
        const isCollapsed = collapsedWs[w.workspaceId] === true;
        const allSessions = (w.sessionIds || []).filter(id => !deletedSessionIds.has(id));
        const activeSessions = allSessions.filter(id => !archivedIds.has(id));
        const archivedSessions = allSessions.filter(id => archivedIds.has(id));
        const isArchiveOpen = openArchives[w.workspaceId] === true;

        return h(
          'div',
          { key: w.workspaceId, className: 'dpd-ws-box' },
          h(
            'div',
            {
              className: 'dpd-row dpd-ws-row',
              onClick: () => setCollapsedWs(prev => ({ ...prev, [w.workspaceId]: !isCollapsed }))
            },
            h('span', { className: `dpd-chevron-icon ${!isCollapsed ? 'dpd-chevron-open' : ''}` },
              h(Icon, { name: 'chevron', size: 12 })
            ),
            h(Icon, { name: 'workspace' }),
            h('span', { className: 'dpd-label', title: w.path }, w.title || '工作区'),
            h('span', { className: 'dpd-badge' }, activeSessions.length),
            h(
              'div',
              { className: 'dpd-hover-actions' },
              h(
                'button',
                {
                  className: 'dpd-icon-btn',
                  title: '发起新会话',
                  onClick: (e) => { e.stopPropagation(); startSession(w.workspaceId); }
                },
                h(Icon, { name: 'plus' })
              ),
              h(
                'select',
                {
                  className: 'dpd-select-move',
                  value: assignedWs.get(w.workspaceId) || '',
                  onClick: e => e.stopPropagation(),
                  onChange: e => handleMoveWorkspace(w.workspaceId, e.target.value)
                },
                h('option', { value: '' }, '归组...'),
                (config.groups || []).map(g => h('option', { key: g.id, value: g.id }, g.name))
              )
            )
          ),
          // Expanded Sessions List
          !isCollapsed && h(
            'div',
            { className: 'dpd-sess-box' },
            activeSessions.length === 0 && h('div', { style: { padding: '4px 8px', opacity: 0.5, fontSize: 12.5 } }, '暂无活跃会话'),
            activeSessions.map(id => renderSession(id, false)),
            archivedSessions.length > 0 && h(
              'div',
              null,
              h(
                'div',
                {
                  className: 'dpd-archive-toggle',
                  onClick: () => setOpenArchives(prev => ({ ...prev, [w.workspaceId]: !isArchiveOpen }))
                },
                h('span', { className: `dpd-chevron-icon ${isArchiveOpen ? 'dpd-chevron-open' : ''}` },
                  h(Icon, { name: 'chevron', size: 12 })
                ),
                h(Icon, { name: 'archive' }),
                `已归档 (${archivedSessions.length})`
              ),
              isArchiveOpen && archivedSessions.map(id => renderSession(id, true))
            )
          )
        );
      };

      return h(
        'div',
        { className: 'dpd-root' },
        // Top Header
        h(
          'div',
          { className: 'dpd-header' },
          h(
            'div',
            { className: 'dpd-header-left' },
            h(Icon, { name: 'folderOpen', size: 15 }),
            h('span', null, '项目组')
          ),
          h(
            'div',
            { className: 'dpd-header-actions' },
            h(
              'button',
              {
                className: 'dpd-btn-head',
                title: '新建项目文件夹',
                onClick: () => setShowNewGroup(true)
              },
              h(Icon, { name: 'plus', size: 12 }),
              '新建组'
            ),
            h(
              'button',
              {
                className: 'dpd-btn-head',
                title: '一键切换回系统原生工作区列表',
                onClick: () => updateViewState({ mode: 'native' })
              },
              h(Icon, { name: 'list', size: 12 }),
              '原生视图'
            )
          )
        ),

        // Scrollable Groups Tree
        h(
          'div',
          { className: 'dpd-scroll' },
          (config.groups || []).map(group => {
            const isCollapsed = collapsedGroups[group.id] === true;
            const members = workspaces.filter(w => (group.workspaceIds || []).includes(w.workspaceId));
            return h(
              'div',
              { key: group.id, className: 'dpd-group-block' },
              h(
                'div',
                {
                  className: 'dpd-row dpd-group-row',
                  onClick: () => setCollapsedGroups(prev => ({ ...prev, [group.id]: !isCollapsed }))
                },
                h('span', { className: `dpd-chevron-icon ${!isCollapsed ? 'dpd-chevron-open' : ''}` },
                  h(Icon, { name: 'chevron', size: 12 })
                ),
                h(Icon, { name: isCollapsed ? 'folder' : 'folderOpen' }),
                h('span', { className: 'dpd-label' }, group.name),
                h('span', { className: 'dpd-badge' }, `${members.length}个工程`),
                h(
                  'div',
                  { className: 'dpd-hover-actions' },
                  h(
                    'button',
                    {
                      className: 'dpd-icon-btn danger',
                      title: '解散项目组',
                      onClick: (e) => handleRemoveGroup(group.id, e)
                    },
                    h(Icon, { name: 'close' })
                  )
                )
              ),
              !isCollapsed && members.map(w => renderWorkspace(w))
            );
          }),

          // Uncategorized Projects
          uncategorized.length > 0 && h(
            'div',
            { className: 'dpd-group-block' },
            h(
              'div',
              { className: 'dpd-row dpd-group-row', style: { opacity: 0.7 } },
              h(Icon, { name: 'folder' }),
              h('span', { className: 'dpd-label' }, '未分类工程'),
              h('span', { className: 'dpd-badge' }, uncategorized.length)
            ),
            uncategorized.map(w => renderWorkspace(w))
          )
        ),

        // Modal: Add Group
        showNewGroup && h(
          'div',
          { className: 'dpd-modal-mask', onClick: () => setShowNewGroup(false) },
          h(
            'div',
            { className: 'dpd-modal-card', onClick: e => e.stopPropagation() },
            h('h4', { className: 'dpd-modal-title' }, '新建项目组'),
            h('input', {
              className: 'dpd-modal-input',
              placeholder: '例如: 天喻PLM项目组',
              value: groupNameInput,
              autoFocus: true,
              onChange: e => setGroupNameInput(e.target.value),
              onKeyDown: e => e.key === 'Enter' && handleAddGroup()
            }),
            h(
              'div',
              { className: 'dpd-modal-btns' },
              h('button', { className: 'dpd-btn cancel', onClick: () => setShowNewGroup(false) }, '取消'),
              h('button', { className: 'dpd-btn primary', onClick: handleAddGroup }, '创建')
            )
          )
        ),

        // Modal: Delete Session Confirmation
        deleteTarget && h(
          'div',
          { className: 'dpd-modal-mask', onClick: () => setDeleteTarget(null) },
          h(
            'div',
            { className: 'dpd-modal-card', onClick: e => e.stopPropagation() },
            h('h4', { className: 'dpd-modal-title', style: { color: '#ef4444' } }, '彻底删除会话'),
            h('p', { className: 'dpd-modal-desc' },
              `确定要彻底删除会话「${deleteTarget.title || '此会话'}」吗？删除后会话记录与日志将无法找回。`
            ),
            h(
              'div',
              { className: 'dpd-modal-btns' },
              h('button', { className: 'dpd-btn cancel', onClick: () => setDeleteTarget(null) }, '取消'),
              h('button', {
                className: 'dpd-btn danger',
                onClick: handleConfirmDelete
              }, '删除')
            )
          )
        )
      );
    }

    // Toggle button in sidebar footer
    function ModeToggleFooter() {
      const state = useViewState();
      const isTree = state.mode === 'tree';
      return h(
        'button',
        {
          type: 'button',
          className: 'dpd-foot-toggle',
          title: isTree ? '切换为原生工作区列表' : '切换为项目组树视图',
          onClick: () => updateViewState({ mode: isTree ? 'native' : 'tree' })
        },
        h(Icon, { name: isTree ? 'list' : 'folder', size: 15 }),
        h('span', null, isTree ? '切换原生视图' : '切换项目组视图')
      );
    }

    const inject = ['slots', 'remote', 'typert', 'workspaces', 'sessions'];

    function apply(ctx) {
      ensureStyles();

      const openSession = (sessionId) => {
        const uiWorkspace = ctx.get('uiWorkspace');
        if (uiWorkspace && typeof uiWorkspace.openSession === 'function') {
          uiWorkspace.openSession(sessionId);
          return;
        }
        const sessions = ctx.get('sessions');
        if (sessions && typeof sessions.retain === 'function') {
          sessions.retain(sessionId, { source: 'mainView' });
        }
        const layout = ctx.get('layout');
        if (layout && typeof layout.selectPanel === 'function') {
          layout.selectPanel(null);
        }
      };

      const startSession = (workspaceId) => {
        const uiWorkspace = ctx.get('uiWorkspace');
        if (uiWorkspace && typeof uiWorkspace.startSession === 'function') {
          uiWorkspace.startSession(workspaceId);
        }
      };

      const archiveSession = (sessionId) => {
        const workspaces = ctx.get('workspaces');
        return workspaces?.archiveSession?.(sessionId, { stopActivity: true });
      };

      const unarchiveSession = (sessionId) => {
        const workspaces = ctx.get('workspaces');
        return workspaces?.unarchiveSession?.(sessionId);
      };

      const deleteSession = async (sessionId) => {
        // Step 1: First archive it with stopActivity so DSH stops background activities immediately
        try {
          const workspaces = ctx.get('workspaces');
          await workspaces?.archiveSession?.(sessionId, { stopActivity: true });
        } catch (e) {}

        // Step 2: Try native typert RPC remote.workspaceRegistry.deleteSession
        // Since @michengai/dsh-archive-manager is installed, this RPC is fully wired to backend deletion
        try {
          const registry = ctx.get('remote.workspaceRegistry');
          if (registry && typeof registry.deleteSession === 'function') {
            const res = await registry.deleteSession(sessionId);
            if (res && res.ok !== false) {
              ctx.get('sessions')?.refresh?.();
              ctx.get('workspaces')?.refresh?.();
            }
          }
        } catch (e) {
          console.warn('remote.workspaceRegistry deleteSession:', e);
        }

        // Step 3: Also call host custom endpoint for guaranteed disk/registry/transcript cleanup
        try {
          await fetch('/dsh-project-deck/delete-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
        } catch (e) {
          console.warn('host delete-session endpoint:', e);
        }

        // Step 4: Refresh observable stores
        try {
          ctx.get('sessions')?.refresh?.();
          ctx.get('workspaces')?.refresh?.();
        } catch (e) {}
      };

      const injectedProps = () => ({
        workspacesStore: ctx.get('workspaces')?.list,
        sessionsStore: ctx.get('sessions')?.list,
        openSession,
        startSession,
        archiveSession,
        unarchiveSession,
        deleteSession
      });

      // Hook sidebar.workspaces slot dynamically based on viewMode
      ctx.slots.inject('sidebar.workspaces', () => {
        let disposeRegistration;

        const sync = () => {
          const wanted = getViewState().mode === 'tree';
          if (wanted && disposeRegistration === undefined) {
            disposeRegistration = ctx.slots.register(
              {
                name: 'sidebar.workspaces',
                priority: -100,
                registrant: PLUGIN_ID,
                inject: injectedProps
              },
              ProjectDeckTree
            );
          } else if (!wanted && disposeRegistration !== undefined) {
            disposeRegistration();
            disposeRegistration = undefined;
          }
        };

        const unsubscribe = subscribeViewState(sync);
        sync();

        return () => {
          unsubscribe();
          if (disposeRegistration !== undefined) {
            disposeRegistration();
            disposeRegistration = undefined;
          }
        };
      });

      // Register permanent toggle in sidebar footer
      ctx.slots.inject('sidebar.footer.action', () => {
        return ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'project-deck-toggle',
            order: 40,
            label: '视图切换',
            registrant: PLUGIN_ID
          },
          ModeToggleFooter
        );
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
