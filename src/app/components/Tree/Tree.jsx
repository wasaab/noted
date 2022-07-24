import PropTypes from 'prop-types';
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { styled } from '@mui/material/styles';

const StyledTreeView = styled(TreeView)({
  width: '100%',
  height: '100%',
  flexGrow: 1,
  overflowY: 'overlay',
  padding: '8px 0px'
});

const Tree = ({ children, ...rest }) => (
  <StyledTreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
    {...rest}
  >
    {children}
  </StyledTreeView>
);

Tree.propTypes = {
  children: PropTypes.node
};

Tree.defaultProps = {
  children: <></>
};

export default Tree;
