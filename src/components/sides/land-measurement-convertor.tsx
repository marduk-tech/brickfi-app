import { useState } from "react";
import { Input, Select, Table, Typography } from "antd";
import { FONT_SIZE } from "../../theme/style-constants";
import { useDevice } from "../../hooks/use-device";

const { Option } = Select;

// Conversion rates relative to 1 acre for simplicity
const conversionRates = {
  acre: 1,
  sq_ft: 43560,
  sq_yd: 4840,
  guntha: 40,
  cent: 100,
  hectare: 0.4047,
};

const units = [
  {
    label: "Square Foot",
    value: "sq_ft",
    description: "About the size of a large dining table.",
  },
  {
    label: "Square Yard or Gaz",
    value: "sq_yd",
    description: "Similar to a small bathroom.",
  },
  {
    label: "Cent",
    value: "cent",
    description: "Roughly the size of two large parking spaces.",
  },
  {
    label: "Guntha",
    value: "guntha",
    description: "About the area of a standard basketball half-court.",
  },
  {
    label: "Acre",
    value: "acre",
    description: "A little more than your average football field.",
  },
  {
    label: "Hectare",
    value: "hectare",
    description: "Roughly the area of two football fields.",
  },
];

const LandMeasurementConvertor = () => {
  const { isMobile } = useDevice();
  const [inputValue, setInputValue] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("acre");

  // Calculate conversions based on input value and selected unit
  const convertValues = () => {
    const baseValueInAcres =
      inputValue / (conversionRates as any)[selectedUnit];
    return units.map((unit) => ({
      unit: unit.label,
      description: unit.description || "",
      value: (baseValueInAcres * (conversionRates as any)[unit.value]).toFixed(
        4
      ),
    }));
  };

  const handleInputChange = (e: any) => {
    setInputValue(parseFloat(e.target.value) || 0);
  };

  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
  };

  const columns = [
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    ...(!isMobile
      ? [
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
          },
        ]
      : []),
    {
      title: "Converted Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        style={{
          width: "15%",
          marginRight: "8px",
          fontSize: FONT_SIZE.HEADING_3,
          fontWeight: "bold",
        }}
      />
      <Select
        defaultValue="acre"
        onChange={handleUnitChange}
        labelRender={(labelProps) => {
          return (
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: "bold" }}
            >
              {labelProps.label}
            </Typography.Text>
          );
        }}
        style={{ width: "82%" }}
      >
        {units.map((unit) => (
          <Option key={unit.value} value={unit.value}>
            {unit.label}
          </Option>
        ))}
      </Select>
      <Table
        dataSource={convertValues()}
        columns={columns}
        pagination={false}
        rowKey="unit"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default LandMeasurementConvertor;
