import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import Highlighter from 'react-highlight-words';
import TreeItem from './TreeItem';

const SearchTreeItem = ({ labelIcon, labelText, queryMatcher, ...rest }) => (
  <TreeItem
    label={
      <Box display="flex" alignItems="center" p={0.5} pr={0}>
        <Box component={labelIcon} color="inherit" fontSize={16} mr={1} />
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            fontWeight: 'inherit',
            wordBreak: 'break-word'
          }}
        >
          <Highlighter
            searchWords={[queryMatcher]}
            textToHighlight={labelText}
          />
        </Typography>
      </Box>
    }
    {...rest}
  />
);

SearchTreeItem.propTypes = {
  labelIcon: PropTypes.elementType,
  labelText: PropTypes.string.isRequired,
  queryMatcher: PropTypes.instanceOf(RegExp).isRequired
};

SearchTreeItem.defaultProps = {
  labelIcon: undefined
};

export default SearchTreeItem;
