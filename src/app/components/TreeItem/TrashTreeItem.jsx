import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import TreeItem from './TreeItem';

const TrashTreeItem = ({ labelIcon, labelText, level, ...rest }) => {
  const renderLabel = () => (
    <Box display="flex" alignItems="center">
      <Box
        component={labelIcon}
        color="inherit"
        fontSize={16}
        ml={0.5}
        mr={1}
      />
      <Typography variant="body2" sx={{ flexGrow: 1 }} pt={0.5} pb={0.5}>
        {labelText}
      </Typography>
    </Box>
  );

  return <TreeItem label={renderLabel()} level={level} {...rest} />;
};

TrashTreeItem.propTypes = {
  labelIcon: PropTypes.elementType.isRequired,
  labelText: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired
};

export default TrashTreeItem;
