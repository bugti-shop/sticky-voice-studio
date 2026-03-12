

## Native Performance Optimization Techniques for Your App

Here's what can be done to make your app feel **faster and smoother** — excluding lazy loading, which you already have. Each technique includes the **English prompt** you can use to implement it.

---

### 1. CSS `contain` and `will-change` for Rendering Performance
**What it does**: Tells the browser to isolate elements during paint/layout, reducing work when things change. Scroll, animations, and transitions become noticeably smoother — especially on Android.

**Prompt**:
> "Add CSS `contain: content` to NoteCard, TaskItem, and all list item components. Add `will-change: transform` to elements that animate (swipe actions, drag items, sheets). Add `contain: strict` to scroll containers. This reduces browser layout/paint work and makes scrolling smoother."

---

### 2. `React.memo` + Stable Callbacks Audit
**What it does**: Prevents components from re-rendering when their parent re-renders but their props haven't changed. Currently `TaskItem` uses `memo` but `NoteCard` (483 lines) and many view components don't. Unstable inline callbacks defeat `memo`.

**Prompt**:
> "Audit all list-rendered components (NoteCard, TaskFlatItem, KanbanView cards, TimelineView items) and wrap them with React.memo. Ensure all callback props passed to them use useCallback with proper dependency arrays. Move inline arrow functions out of JSX map() calls into stable refs."

---

### 3. Debounce State Updates on Rapid Interactions
**What it does**: When the user types in search, drags items, or scrolls filters, the app currently re-renders on every keystroke/frame. Debouncing batches these into fewer renders.

**Prompt**:
> "Add useDeferredValue or debounced state for: viewModeSearch input in Today.tsx, any search/filter inputs in Notes.tsx, and the sort/group dropdowns. Use React.startTransition for non-urgent state updates like changing viewMode, sortBy, and groupByOption so the UI stays responsive during transitions."

---

### 4. CSS Hardware Acceleration for Animations
**What it does**: Forces animations onto the GPU instead of CPU. Swipe gestures, sheet openings, and drag-drop become 60fps smooth.

**Prompt**:
> "Replace all CSS `top`/`left`/`margin` animations with `transform: translate()` equivalents. Add `transform: translateZ(0)` or `will-change: transform` to TaskSwipeActions, all Sheet/Drawer components, and draggable items. Ensure framer-motion components use `layout` prop sparingly — only where needed."

---

### 5. Reduce Bundle Size — Tree-shake Icons
**What it does**: Your app imports many individual icons from `lucide-react`. Each import is small, but Today.tsx alone imports 30+ icons. Consolidating and removing unused ones speeds up initial load.

**Prompt**:
> "Audit all lucide-react imports across the app. Remove any icons that are imported but never used in JSX. In Today.tsx, move icon imports that are only used inside extracted view components (KanbanView, TimelineView, etc.) into those component files instead."

---

### 6. IndexedDB Read Optimization with Cursor Streaming
**What it does**: Currently `loadTasksFromDB` uses `getAll()` which loads everything into memory at once. For 600k+ tasks, streaming with cursors + pagination would reduce initial memory spike and time-to-interactive.

**Prompt**:
> "In taskStorage.ts, add a `loadTasksPagedFromDB(offset, limit)` function that uses an IDBCursor instead of getAll(). Update the Today page to load the first 100 tasks immediately, then stream remaining tasks in background batches of 500 using requestIdleCallback. Show tasks progressively as they load."

---

### 7. RichTextEditor Code Splitting (3044 lines!)
**What it does**: `RichTextEditor.tsx` is your **largest file at 3,044 lines**. Even though the component itself may be lazy-loaded, its internal logic runs entirely on mount. Splitting its toolbar, table editor, and formatting logic into smaller chunks improves render time when editing notes.

**Prompt**:
> "Split RichTextEditor.tsx (3044 lines) into smaller modules: extract the toolbar rendering into RichTextToolbar.tsx, the table/context-menu logic into RichTextTableHandler.tsx, the link/image insertion dialogs into RichTextInsertions.tsx, and the auto-detection logic (URLs, emails, phones) into richTextDetection.ts utility. Keep RichTextEditor as a thin orchestrator that composes these pieces."

---

### Summary Table

| Technique | Impact Area | User-Visible Effect |
|-----------|------------|---------------------|
| CSS contain/will-change | Scroll & animations | Smoother scrolling, no jank |
| React.memo audit | All list views | Faster task/note list updates |
| Debounced state | Search, filters | No UI freeze while typing |
| GPU animations | Swipes, sheets, drag | 60fps smooth gestures |
| Tree-shake icons | App startup | ~100-200ms faster first load |
| Cursor streaming | Large datasets | Tasks appear instantly |
| RichTextEditor split | Note editing | Editor opens faster |

These are all **invisible to the user visually** — the app looks the same, but **feels noticeably faster**, especially on mid-range Android devices.

