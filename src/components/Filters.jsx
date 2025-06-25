import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";

function Filters({ filters, setFilters, tagsMap, actorsMap }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaywallChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({
      ...prev,
      paywall: val === "" ? null : val === "true",
    }));
  };

  const handleMultiSelectChange = (e, field) => {
    const value = e.target.value;
    setFilters((prev) => {
      const list = prev[field];
      return {
        ...prev,
        [field]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      publicationDate: {
        ...prev.publicationDate,
        [type]: value,
      },
    }));
  };

  return (
    <Form className="filters mb-4">
      <Row>
        <Col md={6}>
          <Form.Label>
            <strong>Fecha de inicio:</strong>
          </Form.Label>
          <Form.Control
            type="date"
            value={filters.publicationDate.startDate}
            onChange={(e) => handleDateChange(e, "startDate")}
          />
        </Col>
        <Col md={6}>
          <Form.Label>
            <strong>Fecha de fin:</strong>
          </Form.Label>
          <Form.Control
            type="date"
            value={filters.publicationDate.endDate}
            onChange={(e) => handleDateChange(e, "endDate")}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={4}>
          <Form.Control
            name="headline"
            placeholder="Título"
            onChange={handleInputChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="author"
            placeholder="Autor"
            onChange={handleInputChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="sourceName"
            placeholder="Nombre de la fuente"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={4}>
          <Form.Control
            name="location"
            placeholder="Ubicación"
            onChange={handleInputChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="coverageLevel"
            placeholder="Nivel de cobertura"
            onChange={handleInputChange}
          />
        </Col>
        <Col md={4}>
          <Form.Select name="paywall" onChange={handlePaywallChange}>
            <option value="">¿Paywall?</option>
            <option value="true">Si</option>
            <option value="false">No</option>
          </Form.Select>
        </Col>
      </Row>

      <Accordion defaultActiveKey={null} className="mt-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Etiquetas</Accordion.Header>
          <Accordion.Body>
            <Row>
              {Object.entries(tagsMap).map(([id, name]) => (
                <Col key={id} xs={6} md={4} lg={3}>
                  <Form.Check
                    type="checkbox"
                    label={name}
                    value={name}
                    checked={filters.tags.includes(name)}
                    onChange={(e) => handleMultiSelectChange(e, "tags")}
                  />
                </Col>
              ))}
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Actores Mencionados</Accordion.Header>
          <Accordion.Body>
            <Row>
              {Object.entries(actorsMap).map(([id, name]) => (
                <Col key={id} xs={6} md={4} lg={3}>
                  <Form.Check
                    type="checkbox"
                    label={name}
                    value={name}
                    checked={filters.actorsMentioned.includes(name)}
                    onChange={(e) =>
                      handleMultiSelectChange(e, "actorsMentioned")
                    }
                  />
                </Col>
              ))}
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Form>
  );
}

export default Filters;
