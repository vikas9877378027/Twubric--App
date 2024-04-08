import React, { useState, useEffect ,useLayoutEffect} from "react";
import axios from "axios";
import "./Twubric.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Collapse } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SortButtons = ({ onSort }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn btn-primary mb-2"
        onClick={() => setOpen(!open)}
        aria-controls="sort-buttons-collapse"
        aria-expanded={open}
      >
        Sort By
      </button>
      <Collapse in={open}>
        <div id="sort-buttons-collapse mb-2">
          <div className="card card-body">
            <button
              className="btn btn-light"
              onClick={() => onSort("total")}
              title="Press T to sort by Score"
            >
              {" "}
              Score
            </button>
            <button
              className="btn btn-light"
              onClick={() => onSort("friends")}
              title="Press F to sort by Friends"
            >
              Friends
            </button>
            <button
              className="btn btn-light"
              onClick={() => onSort("influence")}
              title="Press I to sort by Influence"
            >
              Influence
            </button>
            <button
              className="btn btn-light"
              onClick={() => onSort("chirpiness")}
              title="Press C to sort by Chirpiness"
            >
              Chirpiness
            </button>
          </div>
        </div>
      </Collapse>
    </>
  );
};

const Twubric = () => {
  const [followers, setFollowers] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const minDate = new Date("1970-01-01T00:00:00Z");

  const handleRemove = (uid) => {
    setFilteredFollowers((currentFollowers) =>
      currentFollowers.filter((follower) => follower.uid !== uid)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        "https://gist.githubusercontent.com/pandemonia/21703a6a303e0487a73b2610c8db41ab/raw/82e3ef99cde5b6e313922a5ccce7f38e17f790ac/twubric.json"
      );
      setFollowers(result.data);
      setFilteredFollowers(result.data); // Initialize filtered followers with all data initially
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter followers based on the start and end date
    const filtered = followers.filter((follower) => {
      const joinDate = new Date(follower.join_date);
      return (
        (!startDate || joinDate >= startDate) &&
        (!endDate || joinDate <= endDate)
      );
    });

    // Apply the date filter along with the current sorting
    handleSort(sortField, filtered);
  }, [startDate, endDate, followers]); // Depend on startDate and endDate to re-filter when changed

  const handleSort = (field, followersToSort = filteredFollowers) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedFollowers = followersToSort.sort((a, b) => {
      const valueA = a.twubric[field];
      const valueB = b.twubric[field];
      if (valueA < valueB) {
        return order === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredFollowers([...sortedFollowers]); // Spread into a new array to trigger state update
  };
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Define key codes for different sorting
      // e.g., "s" for sorting by score, "f" for friends, "i" for influence, "c" for chirpiness
      switch (event.key) {
        case "t":
          handleSort("total");
          break;
        case "f":
          handleSort("friends");
          break;
        case "i":
          handleSort("influence");
          break;
        case "c":
          handleSort("chirpiness");
          break;
        // Add more cases as needed
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [handleSort]);

  return (
    <>
      <SortButtons onSort={handleSort} />
      {/* Datepicker Section */}
      <div className="date-picker-container">
        <ReactDatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          isClearable
          placeholderText="Start Date"
          className="date-picker"
          minDate={new Date("1970-01-04")}
          dateFormat="MMM d, yyyy"
          openToDate={new Date("1970-01-04")} // Open to January 1970
          dropdownMode="select"
          showYearDropdown
          showMonthDropdown
        />
      </div>
      {/* Grid Container */}
      <div className="grid-container">
        {filteredFollowers.map((follower) => (
          <div className="card" key={follower.uid} style={{ width: "18rem" }}>
            {/* Image placeholder if needed */}
            <img
              src={follower.image}
              className="card-img-top"
              alt="image"
            ></img>
            <div className="card-body">
              <h5 className="card-title">{follower.fullname}</h5>
              <p className="card-text">{`Score: ${follower.twubric.total}`}</p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">{`Friends: ${follower.twubric.friends}`}</li>
              <li className="list-group-item">{`Influence: ${follower.twubric.influence}`}</li>
              <li className="list-group-item">{`Chirpiness: ${follower.twubric.chirpiness}`}</li>
            </ul>
            <div className="card-body">
              <a href="#" className="card-body">{` ${new Date(
                follower.join_date
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`}</a>
              <button
                className="card-link btn btn-danger"
                onClick={() => handleRemove(follower.uid)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Twubric;
