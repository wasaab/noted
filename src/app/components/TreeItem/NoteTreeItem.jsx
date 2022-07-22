import { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Menu, MenuItem, OutlinedInput, Typography } from '@mui/material';
import {
  FolderOutlined as FolderIcon,
  TextSnippetOutlined as FileIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import {
  cancelNewNoteRename,
  rename,
  remove,
  toggleFavorite
} from '../../store';
import TreeItem from './TreeItem';

class MenuState {
  static OPEN = 0;
  static CLOSING = 1;
  static CLOSED = 2;
}

const TitleInput = styled(OutlinedInput)(({ theme }) => ({
  '& input': {
    ...theme.typography.body2,
    height: 10,
    padding: '8px 4px'
  }
}));

const NoteTreeItem = ({
  id,
  parentIds,
  createdNoteId,
  labelText,
  isDir,
  isFav,
  ...rest
}) => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState({ state: MenuState.CLOSED });

  const handleRename = ({ target: { value } }) => {
    dispatch(rename({ id, title: value }));
    setEditing(false);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleRename(event);
    } else if (event.key === 'Escape') {
      setEditing(false);
      dispatch(cancelNewNoteRename());
    }
  };

  const handleContextMenuOpen = ({ clientX, clientY }) => {
    setMenu({
      state: MenuState.OPEN,
      position: {
        top: clientY - 6,
        left: clientX + 2
      }
    });
  };

  const closeMenu = () => setMenu({ state: MenuState.CLOSING });
  const handleCloseFinish = () => setMenu({ state: MenuState.CLOSED });

  const handleDelete = () => {
    const parentId = parentIds[parentIds.length - 1];

    dispatch(remove({ id, parentId }));
    closeMenu();
  };

  const initiateRename = (isContextMenu) => {
    if (isContextMenu) {
      closeMenu();
    }

    setEditing(true);
  };

  const handleFavToggle = () => {
    dispatch(toggleFavorite(id));
    closeMenu();
  };

  const renderLabel = () => (
    <Box
      display="flex"
      alignItems="center"
      onContextMenu={handleContextMenuOpen}
    >
      <Box
        component={isDir ? FolderIcon : FileIcon}
        color="inherit"
        fontSize={16}
        ml={0.5}
        mr={editing ? 0.5 : 1}
      />
      {(editing && menu.state === MenuState.CLOSED) || createdNoteId === id ? (
        <TitleInput
          fullWidth
          autoFocus
          sx={{ m: '1px 0px', borderRadius: 0 }}
          defaultValue={labelText}
          onFocus={({ target }) => target.select()}
          onBlur={handleRename}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <Typography
          variant="body2"
          pt={0.5}
          pb={0.5}
          sx={{ flexGrow: 1, wordBreak: 'break-word' }}
          onDoubleClick={() => initiateRename()}
        >
          {labelText}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <TreeItem
        nodeId={id}
        label={renderLabel()}
        level={parentIds.length}
        {...rest}
      />
      <Menu
        open={menu.state === MenuState.OPEN}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={menu.position}
        TransitionProps={{ onExited: handleCloseFinish }}
      >
        {!isDir && (
          <MenuItem onClick={handleFavToggle}>
            {isFav ? 'Unfavorite' : 'Favorite'}
          </MenuItem>
        )}
        <MenuItem onClick={() => initiateRename(true)}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
};

NoteTreeItem.propTypes = {
  id: PropTypes.string.isRequired,
  parentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  createdNoteId: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  isDir: PropTypes.bool.isRequired,
  isFav: PropTypes.bool
};

NoteTreeItem.defaultProps = {
  createdNoteId: undefined,
  isFav: false
};

export default NoteTreeItem;
