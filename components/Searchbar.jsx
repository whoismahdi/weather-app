import React, { useState } from "react";

function CitySearchDropdown({ onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (!value) {
      setSuggestions([]);
      setLoading(false)
      return;
    }
    
    setLoading(true)
    
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${value}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setSuggestions(data.results.slice(0,5));
        setLoading(false)
      });
  };

  const handleSelect = (cityName) => {
    setSearchInput(cityName);
    setSuggestions([]);
    onSelect(cityName);
    setSearchInput("")
  };

  return (<>
    <div className="relative flex flex-row bg-neutral-800 w-full px-4 py-4 rounded-lg w-full items-center justify-center">
    <img src="./assets/images/icon-search.svg" className="justify-start pr-2 text-neutral-200 text-xl font-normal font-[url('Font_Awesome_5_Pro')]" />
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        placeholder="Search for a city..."
        className="w-full py-1 outline-0 bg-neutral-800 text-neutral-50"
      />
      {loading ? (
  <div className="absolute top-full left-0 right-0 bg-neutral-800 border border-gray-600 rounded-lg z-10">
    <div className="px-4 py-2 rounded-lg hover:bg-neutral-700 cursor-pointer text-neutral-50 flex flex-row">
      <img className="pr-2" src="../assets/images/icon-loading.svg" alt="..." /> <>Loading</>
    </div>
  </div>
) : suggestions.length > 0 && (
  <div className="absolute top-full left-0 right-0 bg-neutral-800 border border-gray-600 rounded-lg z-10">
    {suggestions.map((city) => (
      <div
        key={city.id || city.name}
        className="px-4 py-2 rounded-lg hover:bg-neutral-700 cursor-pointer text-neutral-50"
        onClick={() => handleSelect(city.name)}
      >
        {city.name}, {city.country}
      </div>
    ))}
  </div>
)}
    </div>
    <div data-status="Default" className="px-6 py-4 bg-blue-500 w-full sm:w-auto rounded-xl flex justify-center sm:justify-start items-center gap-4">
        <button onClick={()=>{onSelect(searchInput)}} id="searchBtn" className="justify-start text-neutral-50 text-xl font-medium font-[url('DM_Sans')] leading-normal">Search
        </button>
    </div></>
  );
}

export default CitySearchDropdown;
