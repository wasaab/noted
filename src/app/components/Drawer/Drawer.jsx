import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { Box, Paper } from '@mui/material';
import { Resizable } from 're-resizable';
import { IpcEvent } from '../../model';
import Toolbar from './Toolbar';
import { SearchTree, NoteTree } from '../Tree';

const Drawer = ({ onSettingsOpen, onTrashOpen }) => {
  const [query, setQuery] = useState();
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (updatedQuery) => {
    setQuery(updatedQuery);

    if (updatedQuery) {
      window.ipc.send(IpcEvent.SEARCH, updatedQuery);
    } else {
      setSearchResults([]);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

  useEffect(() => window.ipc.on(IpcEvent.SEARCHED, setSearchResults), []);

  return (
    <div>
      <Resizable
        square
        as={Paper}
        enable={{ right: true }}
        elevation={4}
        defaultSize={{
          width: 240,
          height: '100%'
        }}
        maxWidth="80vw"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 'fit-content',
          boxShadow: 3
        }}
      >
        <Box display="flex" flexDirection="column" flex="1" height="100%">
          <Toolbar
            searchResults={searchResults}
            onSettingsOpen={onSettingsOpen}
            onTrashOpen={onTrashOpen}
            onSearchInputChange={debouncedSearch}
          />
          {query && <SearchTree query={query} searchResults={searchResults} />}
          <NoteTree hidden={Boolean(query)} />
        </Box>
      </Resizable>
    </div>
  );
};

Drawer.propTypes = {
  onSettingsOpen: PropTypes.func.isRequired,
  onTrashOpen: PropTypes.func.isRequired
};

export default Drawer;
