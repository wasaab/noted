import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import notesReducer from './notesSlice';

function createMiddleware(getDefaultMiddleware) {
  return localStorage.getItem('env') === 'dev'
    ? getDefaultMiddleware().concat(logger)
    : getDefaultMiddleware();
}

export default configureStore({
  reducer: notesReducer,
  middleware: createMiddleware
});
