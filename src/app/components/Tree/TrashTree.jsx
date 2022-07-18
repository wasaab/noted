import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FolderOutlined as FolderIcon,
  TextSnippetOutlined as FileIcon
} from '@mui/icons-material';
import { TrashTreeItem } from '../TreeItem';
import Tree from './Tree';

/**
 * Builds the tree bottom-up.
 * Trash item parents are static, but children are dynamic.
 *
 * @param {Object} trash - stored trash with parent relations
 * @returns {Object} trash with children relations
 */
function buildTree(trash) {
  return Object.entries(trash).reduce(
    (tree, [id, { parentId, item }]) => {
      const parent = trash[parentId];

      if (tree[parentId]) {
        tree[parentId].childIds.push(id);
      } else if (parent) {
        tree[parentId] = {
          title: parent.item.title,
          childIds: [id]
        };
      } else {
        tree.root.childIds.push(id);
      }

      if (!tree[id]) {
        tree[id] = {
          title: item.title,
          childIds: item.childIds ? [] : undefined
        };
      }

      return tree;
    },
    { root: { childIds: [] } }
  );
}

const TrashTree = ({ initialTrash, selectedId, onSelect }) => {
  const trash = useMemo(() => buildTree(initialTrash), [initialTrash]);

  const handleSelect = (event, id) => {
    onSelect(id, trash);
  };

  const renderTree = (id, level = 1) => {
    const { title, childIds } = trash[id];

    return (
      <TrashTreeItem
        key={id}
        nodeId={id}
        labelText={title}
        labelIcon={childIds ? FolderIcon : FileIcon}
        level={level}
      >
        {childIds?.map((childId) => renderTree(childId, level + 1))}
      </TrashTreeItem>
    );
  };

  return (
    <Tree aria-label="trash" selected={selectedId} onNodeSelect={handleSelect}>
      {trash.root.childIds.map((childId) => renderTree(childId))}
    </Tree>
  );
};

TrashTree.propTypes = {
  initialTrash: PropTypes.shape({
    parentId: PropTypes.string,
    item: PropTypes.shape({
      title: PropTypes.string,
      childIds: PropTypes.arrayOf(PropTypes.string)
    })
  }).isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};

TrashTree.defaultProps = {
  selectedId: ''
};

export default TrashTree;
