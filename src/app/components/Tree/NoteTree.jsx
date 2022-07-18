import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  FolderOutlined as FolderIcon,
  TextSnippetOutlined as FileIcon
} from '@mui/icons-material';
import { DirId } from '../../model';
import { select } from '../../store';
import { NoteTreeItem } from '../TreeItem';
import Tree from './Tree';

const NoteTree = ({ hidden }) => {
  const dispatch = useDispatch();
  const notes = useSelector((store) => store.notes);
  const createdNoteId = useSelector((store) => store.createdNoteId);
  const selectedNoteId = useSelector((store) => store.selectedNoteId);
  const selectedDirId = useSelector((store) => store.selectedDirId);
  const selectedNoteParentIds = useSelector((store) => store.parentIds);
  const itemToParentIds = useRef({});
  const [expanded, setExpanded] = useState([]);

  /**
   * Toggles the expanded state of the tree's items.
   *
   * @param {React.SyntheticEvent} event - expand event
   * @param {string} id - ID of the note/dir that expand was toggled on
   */
  const toggleExpand = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  /**
   * Expands the parents of a note/dir.
   *
   * @param {string} itemId - ID of the note/dir to expand parent of
   */
  const expandParents = (itemId) => {
    const parentIds = itemToParentIds.current[itemId].filter(
      (id) => !expanded.includes(id)
    );

    if (parentIds.length) {
      setExpanded([...expanded, ...parentIds]);
    }
  };

  /**
   * Expands the parents of the selected note.
   * Also sets selected dir and parents if none exist.
   */
  const expandParentsOfSelectedNote = () => {
    if (!selectedNoteId) { return; }

    expandParents(selectedNoteId);

    if (!selectedNoteParentIds) {
      dispatch(select({
        noteId: selectedNoteId,
        parentIds: itemToParentIds.current[selectedNoteId]
      }));
    }
  };

  /**
   * Expands the parents of a newly created dir.
   */
  const expandParentsOfCreatedDir = () => {
    if (createdNoteId !== selectedDirId) { return; }

    expandParents(selectedDirId);
  };

  useEffect(expandParentsOfSelectedNote, [selectedNoteId]);
  useEffect(expandParentsOfCreatedDir, [createdNoteId]);

  const renderTree = (id, parentIds = [DirId.ROOT]) => {
    const { title, childIds } = notes[id];

    const handleSelection = () => {
      const selected = childIds
        ? { parentIds: [...parentIds, id] }
        : { parentIds, noteId: id };

      dispatch(select(selected));
    };

    itemToParentIds.current[id] = parentIds;

    return (
      <NoteTreeItem
        key={id}
        id={id}
        parentIds={parentIds}
        createdNoteId={createdNoteId}
        labelText={title}
        labelIcon={childIds ? FolderIcon : FileIcon}
        onClick={handleSelection}
      >
        {childIds?.map((childId) => renderTree(childId, [...parentIds, id]))}
      </NoteTreeItem>
    );
  };

  return (
    <Tree
      aria-label="explorer"
      expanded={expanded}
      selected={selectedNoteId ?? selectedDirId}
      hidden={hidden}
      onNodeToggle={toggleExpand}
    >
      {notes.root?.childIds.map((id) => renderTree(id))}
    </Tree>
  );
};

NoteTree.propTypes = {
  hidden: PropTypes.bool.isRequired
};

export default NoteTree;
