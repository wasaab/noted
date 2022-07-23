import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  MenuItem,
  styled,
  Tab,
  tabClasses,
  Tabs,
  tabsClasses,
  tabScrollButtonClasses
} from '@mui/material';
import { select, toggleFavorite } from '../../store';

export const favBarHeight = '30px';

const StyledTabs = styled(Tabs)({
  minHeight: favBarHeight,
  backgroundColor: '#333333',
  alignItems: 'center',
  [`& .${tabScrollButtonClasses.root}`]: {
    borderRadius: '100%',
    width: 'fit-content',
    padding: 2,
    margin: 4,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  [`& .${tabsClasses.hideScrollbar}`]: {
    margin: '0px 4px'
  }
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  lineHeight: 'normal',
  maxWidth: 130,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexDirection: 'row',
  borderRadius: 16,
  height: 23,
  minHeight: 23,
  minWidth: 48,
  padding: '0px 8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

/**
 * Gets favorite notes in alphabetical order.
 *
 * @param {Object} notes - all notes
 * @returns {Object[]} the sorted favorite notes
 */
function getSortedFavorites(notes) {
  return Object.entries(notes)
    .filter(([, { favorite }]) => favorite)
    .sort(([, a], [, b]) => a.title.localeCompare(b.title));
}

const FavoritesBar = () => {
  const dispatch = useDispatch();
  const notes = useSelector((store) => store.notes);
  const favoriteNotes = useMemo(() => getSortedFavorites(notes), [notes]);
  const [menuAnchor, setMenuAnchor] = useState();

  const handleContextMenuOpen = ({ target }) => {
    if (!target.classList.contains(tabClasses.root)) { return; }

    setMenuAnchor(target);
  };

  const closeMenu = () => setMenuAnchor();

  const handleUnfavorite = () => {
    dispatch(toggleFavorite(menuAnchor.id));
    closeMenu();
  };

  return (
    <>
      <StyledTabs
        value={false}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        onChange={(event, noteId) => dispatch(select({ noteId }))}
        onContextMenu={handleContextMenuOpen}
      >
        {favoriteNotes.map(([id, { title }]) => (
          <StyledTab key={id} id={id} value={id} label={title} />
        ))}
      </StyledTabs>
      <Menu open={!!menuAnchor} anchorEl={menuAnchor} onClose={closeMenu}>
        <MenuItem onClick={handleUnfavorite}>Unfavorite</MenuItem>
      </Menu>
    </>
  );
};

export default FavoritesBar;
