import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Index from 'app';
import store from '../app/store';

const App = () => (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <Provider store={store}>
            <Index />
          </Provider>
        }
      />
    </Routes>
  </Router>
);

export default App;
