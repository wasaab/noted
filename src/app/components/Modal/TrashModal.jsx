import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFromTrash, restoreFromTrash } from '../../store';
import { DirId } from '../../model';
import { TrashTree } from '../Tree';

const DirChip = ({ label }) => (
  <Chip size="small" color="warning" variant="outlined" label={label} />
);

DirChip.propTypes = {
  label: PropTypes.string.isRequired
};

const TrashModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const notes = useSelector((store) => store.notes);
  const trash = useSelector((store) => store.trash);
  const selectedDirId = useSelector((store) => store.selectedDirId);
  const [destDirId, setDestDirId] = useState('');
  const [selected, setSelected] = useState({});
  const [destOptionIds, setDestOptionIds] = useState([]);
  const prevParentId = trash[selected.id]?.parentId;

  const buildMenuHeaderOptions = () => {
    const headerOptions = [];
    const childIds = trash[selected.id]?.item.childIds;
    const prevParentTitle = notes[prevParentId]?.title;

    if (childIds) {
      headerOptions.push({
        id: DirId.ROOT,
        label: 'Root'
      });
    }

    if (prevParentTitle) {
      headerOptions.push({
        id: prevParentId,
        label: 'Previous',
        title: prevParentTitle
      });
    }

    if (childIds || selectedDirId !== DirId.ROOT) {
      headerOptions.push({
        id: selectedDirId,
        label: 'Selected',
        title: notes[selectedDirId].title
      });
    }

    return headerOptions;
  };

  const menuHeaderOptions = useMemo(buildMenuHeaderOptions, [selected]);

  const handleTrashSelection = (id, updatedTrash) => {
    const { parentId, item } = trash[id];

    if (notes[parentId]) {
      setDestDirId(parentId);
    } else if (!item.childIds && selectedDirId === DirId.ROOT) {
      setDestDirId('');
    } else {
      setDestDirId(selectedDirId);
    }

    setSelected({ id, updatedTrash });
  };

  const renderDestSelectValue = (id) => (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
      {id === prevParentId && <DirChip label="Previous" />}
      {id === selectedDirId && <DirChip label="Selected" />}
      {id === DirId.ROOT ? (
        <DirChip label="Root" />
      ) : (
        <Box ml={1}>{notes[id].title}</Box>
      )}
    </Box>
  );

  const renderDestOption = (id) => id !== prevParentId && (
    <MenuItem key={id} value={id}>
      {notes[id].title}
    </MenuItem>
  );

  const updateDestOptions = () => {
    const dirIds = Object.keys(notes)
      .filter((id) => notes[id].childIds && id !== DirId.ROOT && id !== selectedDirId)
      .sort((a, b) => notes[a].title.toUpperCase().localeCompare(notes[b].title.toUpperCase()));

    setDestOptionIds(dirIds);
  };

  const clearSelections = () => {
    setSelected({});
    setDestDirId('');
  };

  const handleRestore = () => {
    dispatch(restoreFromTrash({ ...selected, destinationDirId: destDirId }));
    clearSelections();
  };

  const handleDelete = () => {
    dispatch(deleteFromTrash(selected));
    clearSelections();
  };

  useEffect(() => {
    if (open) {
      updateDestOptions();
    } else {
      clearSelections();
      setDestOptionIds([]);
    }
  }, [open, notes]);

  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Trash</DialogTitle>
        <DialogContent>
          {Object.keys(trash).length === 0 && (
            <DialogContentText display="flex" flexDirection="column">
              <Typography variant="h6" fontSize="1.1em" component="span">
                Empty
              </Typography>
              Items deleted via the context menu will appear here.
            </DialogContentText>
          )}

          <TrashTree
            initialTrash={trash}
            selectedId={selected.id}
            onSelect={handleTrashSelection}
          />
        </DialogContent>
        <DialogActions disableSpacing sx={{ flexDirection: 'column' }}>
          <TextField
            id="dir"
            label="Destination"
            select
            value={destDirId}
            disabled={!selected.id}
            onChange={({ target: { value } }) => setDestDirId(value)}
            autoFocus
            fullWidth
            margin="normal"
            SelectProps={{
              IconComponent: FolderOpen,
              renderValue: renderDestSelectValue,
              MenuProps: {
                MenuListProps: { dense: true },
                PaperProps: { sx: { maxHeight: 320 } }
              }
            }}
            sx={{
              '& .MuiSelect-icon': {
                right: '14px',
                transform: 'none'
              }
            }}
          >
            {menuHeaderOptions.map(({ id, label, title }) => (
              <MenuItem key={label} value={id}>
                <Typography variant="button" mr={3} color="textSecondary">
                  {label}
                </Typography>
                {title}
              </MenuItem>
            ))}
            {menuHeaderOptions.length !== 0 && <Divider />}
            {destOptionIds.map(renderDestOption)}
          </TextField>

          <Box display="flex" width="100%" gap={1}>
            <Button
              disabled={!selected.id || !destDirId}
              variant="outlined"
              color="success"
              fullWidth
              onClick={handleRestore}
            >
              Restore
            </Button>
            <Button
              disabled={!selected.id}
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
};

TrashModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TrashModal;
