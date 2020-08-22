import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Spinner, Button } from 'react-bootstrap';

import { GlobalContext } from '../../shared/context/GlobalState';
import trivia from '../../shared/api/trivia-quiz';
import EditNote from '../components/EditNote';
import ScoreItem from '../components/ScoreItem';

const Scoreboard = () => {
  const { isLoggedIn, user, logout, clearQA } = useContext(GlobalContext);
  const [loadedScores, setLoadedScores] = useState();
  const [selectedScore, setSelectedId] = useState();
  const [playerName, setPlayerName] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const playerId = useParams().playerId;

  useEffect(() => {
    clearQA();
    setLoadedScores(undefined);
    const fetchScores = async () => {
      try {
        const url = playerId
          ? `/scores/record/${playerId}`
          : '/scores/?sortBy=createdAt:desc';
        const response = await trivia.get(url);

        if (response.data.length > 0)
          setPlayerName(response.data[0].player.name);

        setLoadedScores(response.data);
      } catch (error) {
        console.log(error);
        setPlayerName(error.response.data.name);
      }
    };
    fetchScores();
  }, [playerId, clearQA]);

  const deleteUserOnClick = async () => {
    try {
      await trivia.delete('/users/delete');
      localStorage.removeItem('userData');
      logout(true);
    } catch (error) {}
  };

  const renderTable = () => {
    return (
      <>
        <EditNote
          show={modalShow}
          onHide={() => setModalShow(false)}
          score={selectedScore}
          setLoadedScores={setLoadedScores}
        />

        <h4>
          {(playerId && (playerName || <Spinner animation="grow" />)) ||
            'All Players'}
        </h4>

        <Table striped bordered hover size="sm" responsive="lg" variant="dark">
          <thead>
            <tr>
              {user && user._id !== playerId && <th>Player</th>}
              <th>Score</th>
              <th>Category</th>
              <th>Note</th>
              <th>Date</th>
              {isLoggedIn && <th></th>}
            </tr>
          </thead>
          <tbody>
            {loadedScores &&
              loadedScores.map((score) => (
                <ScoreItem
                  key={score._id}
                  score={score}
                  setSelectedId={setSelectedId}
                  setLoadedScores={setLoadedScores}
                  setModalShow={setModalShow}
                />
              ))}
          </tbody>
        </Table>
        {user && user._id === playerId && (
          <Button
            variant="outline-danger"
            size="sm"
            className="float-right"
            onClick={() => deleteUserOnClick()}
          >
            Delete My Account
          </Button>
        )}
      </>
    );
  };

  return <>{renderTable()}</>;
};

export default Scoreboard;
