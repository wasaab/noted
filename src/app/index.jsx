import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline, styled, ThemeProvider } from '@mui/material';
import debounce from 'lodash.debounce';
import Editor from '@noted-md/rich-markdown-editor';
import {
  Drawer,
  FavoritesBar,
  SettingsModal,
  TrashModal,
  favBarHeight
} from './components';
import { darkTheme, editorColorTheme } from './styles';
import { saveNote } from './store';
import { IpcEvent } from './model';

const StyledEditor = styled(Editor)(({ theme }) => `
  width: 100%;
  background-color: ${theme.palette.grey[900]};

  & > div {
    flex: 1;
    display: flex;
    overflow-y: hidden;
  }

  & > div[readOnly] {
    cursor: not-allowed;
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.04)
    );
  }

  & .ProseMirror {
    width: 0px;
    padding: 16px 32px;
    overflow-y: auto;
    flex: 1;
  }

  & .ProseMirror mark {
    padding: 0px 1px;
  }

  & p > code {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  blockquote {
    color: ${editorColorTheme.quote}
  }
`);

const unselectedInitialVal = '  ';
const newNoteInitialVal = '# ';

class ModalType {
  static SETTINGS = 0;
  static TRASH = 1;
}

export default function Index() {
  const dispatch = useDispatch();
  const selectedNoteId = useSelector((store) => store.selectedNoteId);
  const [initialValue, setInitialValue] = useState(unselectedInitialVal);
  const [modalType, setModalType] = useState();

  const handleInputChange = (val) => {
    dispatch(saveNote(val()));
  };

  const debouncedSave = useCallback(debounce(handleInputChange, 500), []);

  const handleSettingsSave = () => {
    setModalType();
    window.ipc.send(IpcEvent.SAVE_SETTINGS);
  };

  const handleModalClose = () => setModalType();

  useEffect(() => window.ipc.on(
    IpcEvent.NOTE_OPENED,
    (content) => setInitialValue(content || newNoteInitialVal)
  ), []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <Box display="flex" height="100%" spellCheck={false}>
        <SettingsModal
          open={modalType === ModalType.SETTINGS}
          onSave={handleSettingsSave}
          onClose={handleModalClose}
        />
        <TrashModal
          open={modalType === ModalType.TRASH}
          onClose={handleModalClose}
        />
        <Box display="flex" flexDirection="column" width="100%">
          <FavoritesBar />
          <Box display="flex" height={`calc(100% - ${favBarHeight})`}>
            <Drawer
              onSettingsOpen={() => setModalType(ModalType.SETTINGS)}
              onTrashOpen={() => setModalType(ModalType.TRASH)}
            />
            <StyledEditor
              dark
              value={selectedNoteId ? initialValue : unselectedInitialVal}
              placeholder="# Title"
              readOnly={!selectedNoteId}
              dictionary={{ newLineEmpty: undefined }}
              colorTheme={editorColorTheme}
              onChange={debouncedSave}
              onBlur={() => setInitialValue('')}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
