import React, { createContext, useReducer, useCallback } from 'react';
import jwt from 'jsonwebtoken';

import {
  RESET_HTTP_ERROR,
  RESET_SIGNUP,
  SIGNUP,
  LOGIN,
  LOGOUT,
  SET_OPTION,
  PLAYING_STATUS,
  START_GAME,
  FETCH_QA,
  CLEAR_QA,
  INC_QNUMBER,
  SAVE_SCORE,
  BOOL_SCORE,
} from './GlobalReducer';
import GlobalReducer from './GlobalReducer';
import opentdb from '../api/opentdb';
import trivia from '../api/trivia-quiz';

const initialState = {
  httpError: null,
  isLoggedIn: false,
  isSignedUp: false,
  user: null,
  playingStatus: 'OPTION',
  questionNumber: 0,
  option: {},
  qa: [],
  score: 0,
  boolScore: [],
  start: false,
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);

  const resetHttpError = async () => {
    dispatch({
      type: RESET_HTTP_ERROR,
    });
  };

  const resetSignup = async () => {
    dispatch({
      type: RESET_SIGNUP,
    });
  };

  const signup = async (name, email, password, image) => {
    let error = null;
    let isSignedUp = false;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('image', image);

    try {
      await trivia.post('/users', formData);

      isSignedUp = true;
    } catch (e) {
      error = e.response.data.error;
    }

    dispatch({
      type: SIGNUP,
      payload: { isSignedUp, error },
    });
  };

  const login = useCallback(async (email, password, userData) => {
    let user = null;
    let error = null;
    let isLoggedIn = false;

    if (!email && !password && userData) {
      isLoggedIn = true;
      user = userData;
    } else {
      try {
        const response = await trivia.post('/users/login', {
          email,
          password,
        });

        if (response.status === 200) {
          user = response.data.user;
          isLoggedIn = true;
        } else {
          throw new Error(response);
        }

        localStorage.setItem(
          'userData',
          JSON.stringify({
            ...user,
          })
        );

        const remainingTime = user.exp * 1000 - new Date().getTime();
        setTimeout(() => {
          logout();
        }, remainingTime);
      } catch (e) {
        error = e.response.data.error;
      }
    }

    dispatch({
      type: LOGIN,
      payload: { isLoggedIn, user, error },
    });
  }, []);

  const logout = async () => {
    try {
      await trivia.post('/users/logout', {
        logout: true,
        _id: JSON.parse(localStorage.getItem('userData'))._id,
      });

      localStorage.removeItem('userData');
    } catch (error) {
      console.log(error);
    }

    dispatch({
      type: LOGOUT,
    });
  };

  const setPlayingStatus = (playingStatus) => {
    dispatch({
      type: PLAYING_STATUS,
      payload: playingStatus,
    });
  };

  const startGame = (start) => {
    dispatch({
      type: START_GAME,
      payload: start,
    });
  };

  const setOption = (option) => {
    dispatch({
      type: SET_OPTION,
      payload: option,
    });
  };

  const fetchQA = async () => {
    setPlayingStatus('LOADING');
    const { category } = state.option;
    const amount = 2;
    const params = Object.assign(
      { encode: 'base64' },
      category && { category },
      amount && { amount }
    );

    const response = await opentdb.get('', {
      params,
    });

    dispatch({
      type: FETCH_QA,
      payload: response.data.results,
    });
    setPlayingStatus('PLAYING');
  };

  const clearQA = () => {
    const resetState = {
      questionNumber: 0,
      option: {},
      qa: [],
      score: 0,
      boolScore: [],
      start: false,
    };

    dispatch({
      type: CLEAR_QA,
      payload: resetState,
    });
  };

  const incrementQNumber = (n) => {
    dispatch({
      type: INC_QNUMBER,
      payload: n,
    });
  };

  const saveScore = (score) => {
    dispatch({
      type: SAVE_SCORE,
      payload: score,
    });
  };

  const setBoolScore = (bool) => {
    dispatch({
      type: BOOL_SCORE,
      payload: [...state.boolScore, bool],
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        httpError: state.httpError,
        isSignedUp: state.isSignedUp,
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        playingStatus: state.playingStatus,
        start: state.start,
        option: state.option,
        questionNumber: state.questionNumber,
        qa: state.qa,
        score: state.score,
        boolScore: state.boolScore,
        resetHttpError,
        resetSignup,
        signup,
        login,
        logout,
        setPlayingStatus,
        startGame,
        setOption,
        fetchQA,
        clearQA,
        incrementQNumber,
        saveScore,
        setBoolScore,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};