import { Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";
interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;
  getTabState: (projectId: Id<"projects">) => TabState;
  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean },
  ) => void;
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  closeAllTabs: (projectId: Id<"projects">) => void;
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),
  getTabState: (projectId) => {
    const state = get().tabs.get(projectId);
    return state || defaultTabState;
  },
  openFile: (projectId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, previewTabId } = tabState;
    const isAlreadyOpen = openTabs.includes(fileId);
    // If the file is opened as preview
    if (!isAlreadyOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((tabId) => (tabId === previewTabId ? fileId : tabId))
        : [...openTabs, fileId];
      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // If the file is opened as pinned
    if (!isAlreadyOpen && pinned) {
      tabs.set(projectId, {
        ...tabState,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // If the file is already open
    const shouldPin = pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...tabState,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : tabState.previewTabId,
    });
    set({ tabs });
  },
  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = tabState;

    const tabIndex = openTabs.indexOf(fileId);
    if (tabIndex === -1) return; // Tab not found

    const newOpenTabs = openTabs.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newOpenTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newOpenTabs.length) {
        newActiveTabId = newOpenTabs[newOpenTabs.length - 1];
      } else {
        newActiveTabId = newOpenTabs[tabIndex];
      }
      const newPreviewTabId = previewTabId === fileId ? null : previewTabId;
      tabs.set(projectId, {
        openTabs: newOpenTabs,
        activeTabId: newActiveTabId,
        previewTabId: newPreviewTabId,
      });
      set({ tabs });
    }
  },
  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },
  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) ?? defaultTabState;
    tabs.set(projectId, {
      ...tabState,
      activeTabId: fileId,
    });
    set({ tabs });
  },
}));
