import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const TwubricApp = () => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAscending, setIsAscending] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    axios
      .get("https://gist.githubusercontent.com/pandemonia/21703a6a303e0487a73b2610c8db41ab/raw/82e3ef99cde5b6e313922a5ccce7f38e17f790ac/twubric.json")
      .then(response => {
        setFollowers(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the followers:", error);
        setIsLoading(false);
      });
  }, []);

  const handleSort = useCallback((key) => {
    setIsAscending(prevIsAscending => (sortKey !== key ? true : !prevIsAscending));
    setSortKey(key);
  }, [sortKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 't') handleSort('total');
      else if (event.key === 'f') handleSort('friends');
      else if (event.key === 'i') handleSort('influence');
      else if (event.key === 'c') handleSort('chirpiness');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSort]);

  const removeFollower = uid => {
    setFollowers(currentFollowers => currentFollowers.filter(follower => follower.uid !== uid));
  };

  const filteredAndSortedFollowers = React.useMemo(() => {
    return followers.filter(follower => {
      const joinDate = new Date(follower.join_date);
      return (!startDate || joinDate >= startDate) && (!endDate || joinDate <= endDate);
    }).sort((a, b) => {
      if (!sortKey) return 0;
      const valueA = a.twubric[sortKey];
      const valueB = b.twubric[sortKey];
      return isAscending ? valueA - valueB : valueB - valueA;
    });
  }, [followers, sortKey, isAscending, startDate, endDate]);

  return (
    <div>
      {isLoading ? <p>Loading...</p> : (
        <div className="container mt-3">
          <div className="d-flex justify-content-center align-items-center flex-wrap mb-2">
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              isClearable
              placeholderText="Start date"
              dateFormat="yyyy-MM-dd"
              minDate={new Date('1970-01-01')}
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={50}
              className="form-control"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              isClearable
              placeholderText="End date"
              dateFormat="yyyy-MM-dd"
              showYearDropdown
              dropdownMode="select"
              className="form-control"
            />
            <button className="btn btn-primary" onClick={() => handleSort("total")}>Sort by Total {isAscending ? "↑" : "↓"}</button>
            <button className="btn btn-primary" onClick={() => handleSort("friends")}>Sort by Friends {isAscending ? "↑" : "↓"}</button>
            <button className="btn btn-primary" onClick={() => handleSort("influence")}>Sort by Influence {isAscending ? "↑" : "↓"}</button>
            <button className="btn btn-primary" onClick={() => handleSort("chirpiness")}>Sort by Chirpiness {isAscending ? "↑" : "↓"}</button>
          </div>
          <div className="container mt-3">
  <div className="d-flex justify-content-center align-items-center flex-wrap mb-2">
    {/* DatePickers and Buttons go here */}
  </div>
  <div className="row g-3">
    {filteredAndSortedFollowers.map((follower) => (
      <div key={follower.uid} className="col-12 col-sm-6 col-lg-3">
        <div className="card h-100">
          <div className="card-body">
            <img src={follower.image} alt={follower.fullname} className="rounded-circle mb-2" style={{ width: "50px", height: "50px" }} />
            <h5 className="card-title">{follower.fullname}</h5>
            <p className="card-text">Join Date: {new Date(follower.join_date).toLocaleDateString()}</p>
            <p className="card-text">Twubric:</p>
            <ul>
              <li>Total: {follower.twubric.total}</li>
              <li>Friends: {follower.twubric.friends}</li>
              <li>Influence: {follower.twubric.influence}</li>
              <li>Chirpiness: {follower.twubric.chirpiness}</li>
            </ul>
            <button className="btn btn-danger" onClick={() => removeFollower(follower.uid)}>
              Remove
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

        </div>
      )}
    </div>
  );
};

export default TwubricApp;