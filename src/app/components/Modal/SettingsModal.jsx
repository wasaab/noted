import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField
} from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { createRootDir } from '../../store';
import { DirId, IpcEvent } from '../../model';

const useSettings = () => {
  const dispatch = useDispatch();
  const [notesDir, setNotesDir] = useState(localStorage.getItem(DirId.STORAGE) ?? '');

  useEffect(() => {
    const removeSaveListener = window.ipc.on(
      IpcEvent.SETTINGS_SAVED,
      (selectedNotesDir) => {
        if (!selectedNotesDir) { return; }

        dispatch(createRootDir(selectedNotesDir));
      }
    );

    const removeSelectListener = window.ipc.on(IpcEvent.NOTES_DIR_SELECTED, setNotesDir);

    return () => {
      removeSaveListener();
      removeSelectListener();
    };
  }, []);

  return { notesDir };
};

const SettingsModal = ({ open, onClose, onSave }) => {
  const { notesDir } = useSettings();

  const fireSelectNotesDirEvent = () => {
    window.ipc.send(IpcEvent.SELECT_NOTES_DIR);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <TextField
            value={notesDir}
            autoFocus
            margin="normal"
            id="dir"
            label="Notes Directory"
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="select notes directory"
                    onClick={fireSelectNotesDirEvent}
                    edge="end"
                    size="small"
                    sx={{ p: 1 }}
                  >
                    <FolderOpen />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={onSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default SettingsModal;
