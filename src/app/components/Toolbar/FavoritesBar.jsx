import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  styled,
  Tab,
  Tabs,
  tabsClasses,
  tabScrollButtonClasses
} from '@mui/material';
import { select } from '../../store';

const StyledTabs = styled(Tabs)({
  height: 30,
  minHeight: 30,
  backgroundColor: '#333333',
  alignItems: 'center',
  paddingBottom: 4,
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
  height: 24,
  minHeight: 24,
  minWidth: 48,
  padding: '0px 8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
});

const FavoritesBar = () => {
  const dispatch = useDispatch();
  const notes = useSelector((store) => store.notes);
  const favoriteNotes = useMemo(
    () => Object.entries(notes).filter(([, { favorite }]) => favorite),
    [notes]
  );

  return (
    <StyledTabs
      value={false}
      onChange={(event, noteId) => dispatch(select({ noteId }))}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {favoriteNotes.map(([id, { title }]) => (
        <StyledTab key={id} value={id} label={title} />
      ))}
    </StyledTabs>
  );
};

export default FavoritesBar;
