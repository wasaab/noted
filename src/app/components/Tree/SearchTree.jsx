import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { TextSnippetOutlined as FileIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { select } from '../../store';
import { buildMatcher } from '../../util';
import { SearchTreeItem } from '../TreeItem';
import Tree from './Tree';

const SearchTree = ({ query, searchResults }) => {
  const dispatch = useDispatch();
  const notes = useSelector((store) => store.notes);
  const [expanded, setExpanded] = useState(searchResults.map(({ id }) => id));
  const queryMatcher = useMemo(() => buildMatcher(query), [query]);

  const toggleExpand = (event, nodeIds) => setExpanded(nodeIds);
  const expandAll = () => setExpanded(searchResults.map(({ id }) => id));

  useEffect(expandAll, [searchResults]);

  return (
    <Tree
      aria-label="search results"
      expanded={expanded}
      onNodeToggle={toggleExpand}
    >
      {searchResults.map((searchResult) => (
        <SearchTreeItem
          key={searchResult.id}
          nodeId={searchResult.id}
          labelText={notes[searchResult.id].title}
          labelIcon={FileIcon}
          queryMatcher={queryMatcher}
        >
          {searchResult.hits.map(({ text, lineNum }) => (
            <SearchTreeItem
              key={lineNum}
              nodeId={`${searchResult.id}-${lineNum}`}
              labelText={text}
              queryMatcher={queryMatcher}
              onClick={() => dispatch(select({ noteId: searchResult.id, lineNum }))}
            />
          ))}
        </SearchTreeItem>
      ))}
    </Tree>
  );
};

SearchTree.propTypes = {
  query: PropTypes.string.isRequired,
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
  ).isRequired
};

export default SearchTree;
