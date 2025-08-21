import { AutoComplete, Drawer, Flex, Input, Spin, Typography } from "antd";
import { memo, useEffect, useState } from "react";
import { SearchResult, usePlaceSearch } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

import { NearestTransitStationsDisplay } from "./nearest-transit-stations-display";
import { useDevice } from "../../hooks/use-device";
import { NearestTransitStation } from "../../hooks/use-nearest-transit-stations";

interface SearchSidebarProps {
  onResultSelect: (result: SearchResult) => void;
  onSearchClear: () => void;
  onFetchedTransitDrivers: (transitDrivers: NearestTransitStation[]) => void;
  transitDrivers: IDriverPlace[];
}

export const SearchSidebarComponent: React.FC<SearchSidebarProps> = ({
  onResultSelect,
  onSearchClear,
  onFetchedTransitDrivers,
  transitDrivers,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const { isMobile } = useDevice();

  // Debounce search query to reduce API wait times
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { results, isLoading, isEmpty } = usePlaceSearch(
    debouncedSearchQuery,
    transitDrivers
  );

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setSelectedResult(result);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    if (selectedResult) {
      setSelectedResult(null);
    }
  };

  // Transform search results to AutoComplete options
  const getAutoCompleteOptions = () => {
    if (isLoading) {
      return [
        {
          value: "loading",
          label: (
            <Flex align="center" justify="center" style={{ padding: "8px" }}>
              <Spin size="small" style={{ marginRight: 8 }} />
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                Searching...
              </Typography.Text>
            </Flex>
          ),
          disabled: true,
        },
      ];
    }

    if (isEmpty && debouncedSearchQuery.length >= 2) {
      return [
        {
          value: "no-results",
          label: (
            <Flex align="center" justify="center" style={{ padding: "16px" }}>
              <Typography.Text style={{ color: COLORS.textColorLight }}>
                No results found for "{debouncedSearchQuery}"
              </Typography.Text>
            </Flex>
          ),
          disabled: true,
        },
      ];
    }

    return results.map((result) => ({
      value: result.name,
      label: (
        <Flex gap={4} align="center" style={{ padding: "0 4px" }}>
          {/* Icon */}

          {/* Content */}
          <Flex vertical style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" justify="space-between">
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  fontWeight: 500,
                  color: COLORS.textColorDark,
                }}
                ellipsis={{ tooltip: result.name }}
              >
                {result.name}
              </Typography.Text>
            </Flex>
            {(result.description || result.address) && (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: COLORS.textColorLight,
                  marginTop: 2,
                }}
                ellipsis={{ tooltip: result.address || result.description }}
              >
                {result.address || result.description}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      ),
      result,
    }));
  };

  const handleAutoCompleteSelect = (value: string, option: any) => {
    if (option.result) {
      handleResultClick(option.result);
    }
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {/* Search Header */}
      <Flex
        vertical
        style={{
          padding: "0 16px",
        }}
      >
        <AutoComplete
          size="large"
          onSelect={handleAutoCompleteSelect}
          options={
            debouncedSearchQuery.length >= 2 ? getAutoCompleteOptions() : []
          }
          style={{
            width: "100%",
          }}
          dropdownStyle={{
            maxHeight: 400,
            overflowY: "auto",
          }}
          notFoundContent={null}
          allowClear
          onClear={() => {
            setSelectedResult(null);
            onSearchClear();
          }}
        >
          <Input
            placeholder="Search your place"
            value={searchQuery}
            onChange={handleSearchChange}
            prefix={
              <DynamicReactIcon
                iconName="IoSearch"
                iconSet="io5"
                size={16}
                color={COLORS.textColorLight}
              />
            }
            style={{
              borderRadius: 8,
            }}
          />
        </AutoComplete>
      </Flex>

      {/* Nearest Transit Stations - Show below search input when result is selected */}
      {selectedResult ? (
        isMobile ? (
          <Drawer
            title={null}
            closable={false}
            placement="bottom"
            styles={{
              header: { height: 0 },
              content: { padding: 0 },
              body: { padding: 0 },
            }}
            onClose={() => {
              setSelectedResult(null);
              onSearchClear();
            }}
            height={200}
            mask={false}
            open={!!selectedResult}
          >
            <NearestTransitStationsDisplay
              selectedResult={selectedResult}
              transitDrivers={transitDrivers}
              onFetchedTransitDrivers={onFetchedTransitDrivers}
            />
          </Drawer>
        ) : (
          <NearestTransitStationsDisplay
            selectedResult={selectedResult}
            transitDrivers={transitDrivers}
            onFetchedTransitDrivers={onFetchedTransitDrivers}
          />
        )
      ) : null}

      {/* Footer */}
      {/* <Flex
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
        }}
      >
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
            textAlign: "center",
            width: "100%",
          }}
        >
          Powered by Brickfi 
        </Typography.Text>
      </Flex> */}
    </Flex>
  );
};

export const SearchSidebar = memo(SearchSidebarComponent);
