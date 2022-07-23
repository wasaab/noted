import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import {
  CreateNewFolderOutlined as CreateFolderIcon,
  PictureAsPdf as PdfIcon,
  PostAdd as CreateFileIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addDir, addNote } from '../../store';
import { DirId } from '../../model';

const Caption = ({ text, bold }) => (
  <Typography
    variant="caption"
    lineHeight="inherit"
    fontSize="inherit"
    fontWeight={bold ? 600 : 500}
    textTransform={bold ? 'uppercase' : undefined}
  >
    {text}
  </Typography>
);

Caption.propTypes = {
  text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  bold: PropTypes.bool
};

Caption.defaultProps = {
  bold: false
};

const Counter = ({ label, value }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    lineHeight="inherit"
    gap={0.5}
  >
    <Caption bold text={label} />
    <Caption text={value} />
  </Box>
);

Counter.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired
};

const Toolbar = ({
  searchResults,
  onSettingsOpen,
  onTrashOpen,
  onSearchInputChange
}) => {
  const dispatch = useDispatch();
  const isRootDirCreated = useSelector((store) => !!store.notes.root);
  const selectedDirId = useSelector((store) => store.selectedDirId);
  const [searching, setSearching] = useState(false);
  const hitsCount = useMemo(
    () => searchResults?.reduce((sum, curr) => curr.hitsCount + sum, 0),
    [searchResults]
  );

  const handleSearch = ({ target: { value } }) => {
    const query = value.trim();

    onSearchInputChange(query);
    setSearching(query !== '');
  };

  return (
    <Paper
      square
      elevation={4}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: 3
      }}
    >
      <Box paddingX={1} paddingY={1.5}>
        <TextField
          id="search"
          size="small"
          fullWidth
          variant="outlined"
          multiline
          maxRows={7}
          label="Search"
          disabled={!isRootDirCreated}
          inputProps={{ sx: { color: 'text.secondary' } }}
          onChange={handleSearch}
        />
      </Box>

      <Divider />

      <Box display="flex" justifyContent="space-between">
        <Box display="flex" justifyContent="start" gap={0.25} p={1}>
          <IconButton disabled size="small" color="primary">
            <PdfIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            disabled={!isRootDirCreated}
            onClick={onTrashOpen}
          >
            <RestoreFromTrashIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" onClick={onSettingsOpen}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>

        {searching ? (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            pr={1.5}
            lineHeight={1}
            fontSize="0.64rem"
            color="text.secondary"
          >
            <Counter label="hits" value={hitsCount} />
            <Counter label="notes" value={searchResults.length} />
          </Box>
        ) : (
          <Box display="flex" justifyContent="end" gap={0.25} p={1}>
            <IconButton
              size="small"
              color="secondary"
              disabled={!isRootDirCreated}
              onClick={() => dispatch(addDir())}
            >
              <CreateFolderIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="secondary"
              disabled={selectedDirId === DirId.ROOT}
              onClick={() => dispatch(addNote())}
            >
              <CreateFileIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

Toolbar.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      hitsCount: PropTypes.number,
      hits: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string,
          lineNum: PropTypes.number
        })
      )
    })
  ).isRequired,
  onSettingsOpen: PropTypes.func.isRequired,
  onTrashOpen: PropTypes.func.isRequired,
  onSearchInputChange: PropTypes.func.isRequired
};

export default Toolbar;
