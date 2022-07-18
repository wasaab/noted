import { alpha, createTheme } from '@mui/material';
import {
  blue,
  blueGrey,
  green,
  grey,
  orange,
  purple
} from '@mui/material/colors';

const selectedColor = blue[300];
const borderColor = '#40454b';
const toolbarBgColor = grey[800];
const primaryTextColor = 'white';
const secondaryTextColor = 'rgba(255, 255, 255, 0.7)';

export const editorColorTheme = {
  blockToolbarItem: secondaryTextColor,
  blockToolbarText: 'rgba(255, 255, 255, 0.8)',
  blockToolbarBackground: toolbarBgColor,
  blockToolbarIcon: primaryTextColor,
  blockToolbarIconSelected: selectedColor,
  blockToolbarTextSelected: selectedColor,
  blockToolbarHoverText: primaryTextColor,
  blockToolbarSelectedBackground: alpha(selectedColor, 0.16),
  blockToolbarHoverBackground: 'rgba(255, 255, 255, 0.08)',
  blockToolbarDivider: 'rgba(255, 255, 255, 0.12)',
  background: 'rgb(24, 30, 38)',
  codeBackground: '#1f212d',
  codeBorder: borderColor,
  horizontalRule: borderColor,
  noticeInfoText: primaryTextColor,
  noticeInfoBackground: blue[500],
  noticeWarningBackground: orange[500],
  noticeTipBackground: purple[500],
  textHighlight: blue[200],
  textSecondary: secondaryTextColor,
  toolbarBackground: toolbarBgColor,
  toolbarItem: primaryTextColor,
  toolbarItemSelected: selectedColor,
  tableDivider: borderColor,
  quote: blueGrey[200]
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: blue[300]
    },
    secondary: {
      main: green.A200
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        kbd: {
          display: 'inline-block',
          background: grey[900],
          color: secondaryTextColor,
          borderRadius: 3,
          margin: 2,
          padding: '4px 4px 2px 4px',
          boxShadow: '1px 1px 1px #777, 1px 1.5px 1px #818181',
          verticalAlign: 'text-bottom',
          textTransform: 'capitalize',
          fontFamily: 'Consolas, "Lucida Console", monospace',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1
        },
        [`.cet-window-title,
        .cet-menubar-menu-title,
        .cet-action-label,
        .keybinding`]: {
          color: secondaryTextColor
        }
      }
    }
  }
});

export default darkTheme;
