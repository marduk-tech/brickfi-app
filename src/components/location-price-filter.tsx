import {
  Button,
  Col,
  Divider,
  Flex,
  Modal,
  Select,
  Slider,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { LocationFilters } from "../libs/constants";
import { COLORS } from "../theme/style-constants";

interface LocationAndPriceFiltersProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    location: string[];
    priceRange: [number, number];
  }) => void;
  initialFilters: {
    location: string[] | undefined;
    priceRange: [number, number];
  };
}

export function LocationAndPriceFilters({
  open,
  onClose,
  onApply,
  initialFilters = { location: [], priceRange: [300, 10000] },
}: LocationAndPriceFiltersProps) {
  const [tempLocation, setTempLocation] = useState<string[]>(
    initialFilters.location || [] // Ensure it's an empty array if undefined
  );
  const [tempPriceRange, setTempPriceRange] = useState(
    initialFilters.priceRange
  );

  useEffect(() => {
    if (open) {
      setTempLocation(initialFilters.location || []);
      setTempPriceRange(initialFilters.priceRange);
    }
  }, [open, initialFilters]);

  const hasActiveFilters =
    (tempLocation && tempLocation.length > 0) ||
    tempPriceRange[0] !== initialFilters.priceRange[0] ||
    tempPriceRange[1] !== initialFilters.priceRange[1];

  const handleApply = () => {
    onApply({
      location: tempLocation,
      priceRange: tempPriceRange,
    });
  };

  const handleResetFilters = () => {
    setTempLocation([]);
    setTempPriceRange([300, 1000]);

    onApply({
      location: [],
      priceRange: [300, 1000],
    });
  };

  return (
    <Modal
      title={
        <Typography.Text style={{ fontSize: "22px", fontWeight: "bold" }}>
          Filters
        </Typography.Text>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="reset"
          onClick={handleResetFilters}
          style={{
            visibility: hasActiveFilters ? "visible" : "hidden",
          }}
          size="small"
        >
          Reset Filters
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply} size="small">
          Apply Filters
        </Button>,
      ]}
    >
      {/* Price Range Filter */}
      <div style={{ marginTop: 25 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography.Text style={{ fontSize: "18px", fontWeight: "bold" }}>
            Price Range
          </Typography.Text>

          <Typography.Text style={{ fontSize: "14px" }}>
            Price per sqft
          </Typography.Text>
        </div>

        <Slider
          range
          min={300}
          max={1000}
          step={10}
          value={tempPriceRange}
          onChange={(value) => setTempPriceRange(value as [number, number])}
          tooltip={{
            formatter: (value) => {
              return `₹${value}`;
            },
          }}
        />
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text
            style={{ color: COLORS.textColorLight }}
          >{`Min: ₹${tempPriceRange[0]}`}</Typography.Text>

          <Typography.Text
            style={{ color: COLORS.textColorLight }}
          >{`Max:₹${tempPriceRange[1]}`}</Typography.Text>
        </div>
      </div>

      <Divider />

      {/* Location Filter */}
      <div>
        <Typography.Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Location
        </Typography.Text>
        <Select
          mode="multiple"
          style={{ width: "100%", marginTop: 10, marginBottom: 20 }}
          options={LocationFilters}
          placeholder="Select locations"
          value={tempLocation}
          onChange={(value) => setTempLocation(value)}
          allowClear
        />
      </div>
    </Modal>
  );
}
