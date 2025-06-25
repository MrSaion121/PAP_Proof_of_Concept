import { useEffect, useState } from 'react';
import Filters from './components/Filters';
import ArticleList from './components/ArticleList';

import Container from 'react-bootstrap/Container';
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
    <Container className='app-container mt-4'>
      <h1 >Articulos</h1>
      <Filters
        filters={filters}
        setFilters={setFilters}
        tagsMap={tagsMap}
        actorsMap={actorsMap}
      />
      <hr />
      <h2>Resultados</h2>
      <p>Numero de articulos: {filteredData.length}</p>
      <ArticleList
        articles={filteredData}
        actorsMap={actorsMap}
        tagsMap={tagsMap}
        locationsMap={locationsMap}
      />
    </Container>
  );
}

export default App;
