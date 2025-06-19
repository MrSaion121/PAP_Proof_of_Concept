import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);

  const [tagsMap, setTagsMap] = useState({});
  const [actorsMap, setActorsMap] = useState({});
  const [locationsMap, setLocationsMap] = useState({});

  const [filters, setFilters] = useState({
    publicationDate: {
      startDate: "",
      endDate: ""
    },
    sourceName: "",
    paywall: null,
    headline: "",
    url: "",
    author: "",
    coverageLevel: "",
    actorsMentioned: [],
    tags: [],
    location: ""
  });

  useEffect(() => {
    fetch('http://localhost:3000/articles')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setDataIsLoaded(true);
      });

    Promise.all([
      fetch('http://localhost:3000/tags').then(res => res.json()),
      fetch('http://localhost:3000/actors').then(res => res.json()),
      fetch('http://localhost:3000/locations').then(res => res.json())
    ]).then(([tags, actors, locations]) => {
      const tMap = {}, aMap = {}, lMap = {};
      tags.forEach(tag => tMap[tag.id] = tag.name);
      actors.forEach(actor => aMap[actor.id] = actor.name);
      locations.forEach(loc => lMap[loc.id] = loc.name);
      setTagsMap(tMap);
      setActorsMap(aMap);
      setLocationsMap(lMap);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaywallChange = (e) => {
    const val = e.target.value;
    setFilters(prev => ({
      ...prev,
      paywall: val === "" ? null : val === "true"
    }));
  };

  const handleMultiSelectChange = (e, field) => {
    const value = e.target.value;
    setFilters(prev => {
      const alreadyIncluded = prev[field].includes(value);
      return {
        ...prev,
        [field]: alreadyIncluded
          ? prev[field].filter(v => v !== value)
          : [...prev[field], value]
      };
    });
  };

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      publicationDate: {
        ...prev.publicationDate,
        [type]: value
      }
    }));
  };

  const filteredData = data.filter(item => {
    const articleDate = new Date(item.publicationDate);
    const startDate = filters.publicationDate.startDate ? new Date(filters.publicationDate.startDate) : null;
    const endDate = filters.publicationDate.endDate ? new Date(filters.publicationDate.endDate) : null;

    const isInDateRange =
      (!startDate || articleDate >= startDate) &&
      (!endDate || articleDate <= endDate);

    const headline = item.headline || "";
    const sourceName = item.sourceName || "";
    const paywall = item.paywall;
    const author = item.author || "";
    const coverageLevel = item.coverageLevel || "";

    const actors = Array.isArray(item.actorsMentioned)
      ? item.actorsMentioned.map(id => actorsMap[id]?.toLowerCase() || "").join(', ')
      : "";

    const tags = Array.isArray(item.tags)
      ? item.tags.map(id => tagsMap[id]?.toLowerCase() || "").join(', ')
      : "";

    const location = locationsMap[item.location]?.toLowerCase() || "";

    return (
      isInDateRange &&
      (filters.sourceName === "" || sourceName.toLowerCase().includes(filters.sourceName.toLowerCase())) &&
      (filters.paywall === null || paywall === filters.paywall) &&
      (filters.headline === "" || headline.toLowerCase().includes(filters.headline.toLowerCase())) &&
      (filters.author === "" || author.toLowerCase().includes(filters.author.toLowerCase())) &&
      (filters.coverageLevel === "" || coverageLevel.toLowerCase().includes(filters.coverageLevel.toLowerCase())) &&
      (filters.actorsMentioned.length === 0 || filters.actorsMentioned.some(actor => actors.includes(actor.toLowerCase()))) &&
      (filters.tags.length === 0 || filters.tags.some(tag => tags.includes(tag.toLowerCase()))) &&
      (filters.location === "" || location.includes(filters.location.toLowerCase()))
    );
  });

  if (!dataIsLoaded) return <div>Loading...</div>;

  return (
    <>
      <h1>Articles</h1>
      <div className="filters">
        <input name="headline" placeholder="Headline" onChange={handleInputChange} />
        <input name="author" placeholder="Author" onChange={handleInputChange} />
        <input name="sourceName" placeholder="Source Name" onChange={handleInputChange} />
        <input name="location" placeholder="Location" onChange={handleInputChange} />
        <input name="coverageLevel" placeholder="Coverage Level" onChange={handleInputChange} />
        <select name="paywall" onChange={handlePaywallChange}>
          <option value="">Paywall?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Start Date:
          <input type="date" value={filters.publicationDate.startDate} onChange={(e) => handleDateChange(e, "startDate")} />
        </label>
        <label>End Date:
          <input type="date" value={filters.publicationDate.endDate} onChange={(e) => handleDateChange(e, "endDate")} />
        </label>

        <fieldset>
          <legend>Tags</legend>
          {Object.entries(tagsMap).map(([id, name]) => (
            <label key={id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                value={name}
                checked={filters.tags.includes(name)}
                onChange={(e) => handleMultiSelectChange(e, 'tags')}
              />
              {name}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Actors Mentioned</legend>
          {Object.entries(actorsMap).map(([id, name]) => (
            <label key={id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                value={name}
                checked={filters.actorsMentioned.includes(name)}
                onChange={(e) => handleMultiSelectChange(e, 'actorsMentioned')}
              />
              {name}
            </label>
          ))}
        </fieldset>
      </div>

      <h2>Filtered Articles</h2>
      <p>Number of articles: {filteredData.length}</p>
      <ul>
        {filteredData.map((item) => (
          <li key={item.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{item.headline}</h2>
            <p><strong>Author:</strong> {item.author || 'N/A'}</p>
            <p><strong>Publication Date:</strong> {item.publicationDate || 'N/A'}</p>
            <p><strong>Source Name:</strong> {item.sourceName || 'N/A'}</p>
            <p><strong>Source URL:</strong> <a href={item.url || '#'}>{item.url || 'N/A'}</a></p>
            <p><strong>Paywall:</strong> {item.paywall === true ? 'Yes' : item.paywall === false ? 'No' : 'N/A'}</p>
            <p><strong>Coverage Level:</strong> {item.coverageLevel || 'N/A'}</p>
            <p><strong>Actors Mentioned:</strong> {
              Array.isArray(item.actorsMentioned)
                ? item.actorsMentioned.map(id => actorsMap[id] || id).join(', ')
                : 'N/A'
            }</p>
            <p><strong>Tags:</strong> {
              Array.isArray(item.tags)
                ? item.tags.map(id => tagsMap[id] || id).join(', ')
                : 'N/A'
            }</p>
            <p><strong>Location:</strong> {locationsMap[item.location] || item.location || 'N/A'}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
