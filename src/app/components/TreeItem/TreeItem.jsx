import { TreeItem as MuiTreeItem, treeItemClasses } from '@mui/lab';
import { styled } from '@mui/material/styles';

const TreeItem = styled(MuiTreeItem)(({ theme, level = 1 }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0
  },
  [`& .${treeItemClasses.content}`]: {
    paddingLeft: 8 * level,
    paddingRight: 16,
    boxSizing: 'border-box',
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      color: theme.palette.primary.main
    }
  }
}));

export default TreeItem;
