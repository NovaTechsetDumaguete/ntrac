import React, { createContext, useContext, useState } from "react";

const StateContext = createContext({
  currentUser: null,
  currentTeam: null,
  token: null,
  notification: null,
  processedFile: null,
  waitingForApprovalCount: 0, 
  waitingForApprovalTeamsCount: 0,
  setUser: () => {},
  setToken: () => {},
  setNotification: () => {},
  setFilterString: () => {},
  setEmployees: () => {},
  setTeams: () => {},
  setCurrentTeam: () => {},
  setProcessedFile: () => {},
  setWaitingForApprovalCount: () => {},
  setWaitingForApprovalTeamsCount: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [notification, _setNotification] = useState("");
  const [filterString, _setFilterString] = useState("");
  const [employees, setEmployees] = useState({});
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [processedFile, setProcessedFile] = useState({});
  const [waitingForApprovalCount, setWaitingForApprovalCount] = useState(0);
  const [waitingForApprovalTeamsCount, setWaitingForApprovalTeamsCount] = useState(0);

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setNotification = (message) => {
    _setNotification(message);

    setTimeout(() => {
      _setNotification("");
    }, 5000);
  };

  const setFilterString = (term) => {
    _setFilterString(term);
  };

  return (
    <StateContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        notification,
        setNotification,
        filterString,
        setFilterString,
        employees,
        setEmployees,
        teams,
        setTeams,
        currentTeam,
        setCurrentTeam,
        processedFile,
        setProcessedFile,
        waitingForApprovalCount, 
        setWaitingForApprovalCount, 
        waitingForApprovalTeamsCount,
        setWaitingForApprovalTeamsCount
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
