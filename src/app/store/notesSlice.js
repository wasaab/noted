import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import IpcEvent from '../model/IpcEvent';
import DirId from '../model/DirId';

/**
 * Removes a note/dir from the trash (restore or permanent deletion).
 *
 * @param {IpcEvent} event - IPC event to emit for notes
 * @param {Object} state - state of the notes store
 * @param {Object} updatedTrash - updated trash to remove from
 * @param {string} itemId - ID of the note/dir to remove
 */
function removeFromTrash(event, state, updatedTrash, itemId) {
  function remove(id) {
    const item = updatedTrash[id];

    if (event === IpcEvent.MOVE_TRASH) {
      state.notes[id] = item;
    }

    delete state.trash[id];

    if (item.childIds) {
      item.childIds.forEach(remove);
    } else {
      window.ipc.send(event, id, true);
    }
  }

  remove(itemId);
}

/**
 * Moves a note to the trash, so it can later be restored if desired.
 *
 * @param {Object} state - state of the notes store
 * @param {string} itemId - ID of the note/dir to move to trash
 * @param {string} rootParentId - ID of the item's parent
 */
function moveToTrash(state, itemId, rootParentId) {
  function move(id, parentId) {
    const item = state.notes[id];

    state.trash[id] = { parentId, item };
    delete state.notes[id];

    if (id === state.selectedNoteId) {
      delete state.selectedNoteId;
    } else if (id === state.selectedDirId) {
      state.selectedDirId = rootParentId;
    }

    if (item.childIds) {
      item.childIds.forEach((childId) => move(childId, id));
    } else {
      window.ipc.send(IpcEvent.MOVE_TRASH, id);
    }
  }

  move(itemId, rootParentId);
}

/**
 * Adds a new note/dir to the selected dir.
 *
 * @param {Object} state - state of the notes store
 * @param {string} id - ID of the item
 * @param {string} title - title of the item
 * @param {boolean} isDir - whether the item is a dir
 */
function addItem(state, id, title, isDir) {
  if (id !== DirId.ROOT) {
    delete state.parentIds;
    state.notes[state.selectedDirId].childIds.unshift(id);
    state.createdNoteId = id;
  }

  const item = { title };

  if (isDir) {
    item.childIds = [];
    state.selectedDirId = id;
  } else {
    state.selectedNoteId = id;
  }

  state.notes[id] = item;
}

/**
 * Stores an item in the brower's local storage.
 *
 * @param {string} key - key of the item
 * @param {Object} value - value of the item
 */
function store(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const storeNotes = ({ notes }) => store(DirId.NOTES, notes);
const storeTrash = ({ trash }) => store(DirId.TRASH, trash);

/**
 * Sorts notes/dirs by last updated time in descending order from root dir to saved note.
 * Dirs are sorted by their most recently updated note.
 *
 * @param {Object} state - state of the notes store
 * @param {Object} state.notes - stored notes
 * @param {string} state.selectedNoteId - ID of the selected note that was updated
 * @param {string[]} state.parentIds - IDs of the selected note's parents
 */
function sortNotesByLastUpdated({ notes, selectedNoteId, parentIds }) {
  let isDiffOrder = false;

  parentIds.forEach((parentId, i) => {
    const { childIds } = notes[parentId];
    const targetFirstChildId = parentIds[i + 1] ?? selectedNoteId;

    if (childIds[0] === targetFirstChildId) { return; }

    childIds.splice(childIds.indexOf(targetFirstChildId), 1);
    childIds.unshift(targetFirstChildId);

    if (!isDiffOrder) {
      isDiffOrder = true;
    }
  });

  if (isDiffOrder) {
    storeNotes({ notes });
  }
}

const storedNotes = localStorage.getItem(DirId.NOTES);
const storedTrash = localStorage.getItem(DirId.TRASH);

export const notesSlice = createSlice({
  name: DirId.NOTES,
  initialState: {
    notes: storedNotes ? JSON.parse(storedNotes) : {},
    trash: storedTrash ? JSON.parse(storedTrash) : {},
    selectedDirId: DirId.ROOT,
    selectedNoteId: undefined,
    createdNoteId: undefined, // used to make newly created note's title editable in explorer
    parentIds: undefined, // used to sort note within parents on save
    lineNum: undefined // used to scroll to lineNum upon selecting a search result
  },
  reducers: {
    createRootDir: (state, { payload: selectedNotesDir }) => {
      addItem(state, DirId.ROOT, 'Root Folder', true);
      storeNotes(state);
      localStorage.setItem(DirId.STORAGE, selectedNotesDir);
    },
    addDir: (state) => {
      const dirId = uuid();

      addItem(state, dirId, 'New Folder', true);
      storeNotes(state);
    },
    addNote: (state) => {
      const noteId = uuid();

      addItem(state, noteId, 'New Note');
      window.ipc.send(IpcEvent.SAVE_NOTE, noteId);
      storeNotes(state);
    },
    remove: (state, { payload: { id, parentId } }) => {
      const { childIds } = state.notes[parentId];

      childIds.splice(childIds.indexOf(id), 1);
      moveToTrash(state, id, parentId);
      storeNotes(state);
      storeTrash(state);
    },
    deleteFromTrash: (state, { payload: { id, updatedTrash } }) => {
      removeFromTrash(IpcEvent.DELETE_TRASH, state, updatedTrash, id);
      storeTrash(state);
    },
    restoreFromTrash: (state, { payload: { id, destinationDirId, updatedTrash } }) => {
      removeFromTrash(IpcEvent.MOVE_TRASH, state, updatedTrash, id);
      state.notes[destinationDirId].childIds.push(id);
      storeNotes(state);
      storeTrash(state);
    },
    rename: (state, { payload: { id, title } }) => {
      delete state.createdNoteId;
      state.notes[id].title = title;
      storeNotes(state);
    },
    cancelNewNoteRename: (state) => {
      delete state.createdNoteId;
    },
    select: (state, { payload: { noteId, parentIds, lineNum } }) => {
      if (noteId) {
        state.parentIds = parentIds;

        if (noteId !== state.selectedNoteId) {
          state.selectedNoteId = noteId;
          window.ipc.send(IpcEvent.OPEN_NOTE, noteId);
        }
      }

      if (parentIds) {
        state.selectedDirId = parentIds[parentIds.length - 1];
      }

      state.lineNum = lineNum;
    },
    moveNote: (state, action) => {
      // Todo: Implement
    },
    saveNote: (state, { payload: content }) => {
      window.ipc.send(IpcEvent.SAVE_NOTE, state.selectedNoteId, content);
      sortNotesByLastUpdated(state);
    },
    toggleFavorite: (state, { payload: noteId }) => {
      state.notes[noteId].favorite = !state.notes[noteId].favorite;
      storeNotes(state);
    }
  }
});

export const {
  createRootDir,
  addDir,
  addNote,
  remove,
  deleteFromTrash,
  restoreFromTrash,
  rename,
  cancelNewNoteRename,
  select,
  moveNote,
  saveNote,
  toggleFavorite
} = notesSlice.actions;

export default notesSlice.reducer;
