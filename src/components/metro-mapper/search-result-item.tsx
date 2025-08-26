import { Flex, Tag, Typography } from "antd";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onClick,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "transit":
        return COLORS.primaryColor;
      case "project":
        return COLORS.greenIdentifier;
      case "locality":
        return COLORS.orangeIdentifier;
      case "place":
        return COLORS.yellowIdentifier;
      case "osm":
        return COLORS.textColorDark;
      default:
        return COLORS.textColorDark;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "transit":
        return "Metro";
      case "project":
        return "Project";
      case "locality":
        return "Area";
      case "place":
        return "Place";
      case "osm":
        return "Location";
      default:
        return "Place";
    }
  };

  const getIconSet = (iconName: string) => {
    if (iconName.startsWith("Io")) return "io5";
    if (iconName.startsWith("Fa")) return "fa";
    if (iconName.startsWith("Md")) return "md";
    if (iconName.startsWith("Gi")) return "gi";
    if (iconName.startsWith("Bi")) return "bi";
    return "io5";
  };

  return (
    <Flex
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: `1px solid ${COLORS.borderColor}`,
        transition: "background-color 0.2s ease",
      }}
      gap={12}
      align="center"
      onClick={() => onClick(result)}
      className="search-result-item"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.bgColorMedium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Icon */}
      <Flex
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: COLORS.bgColorMedium,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <DynamicReactIcon
          iconName={result.icon || "IoLocationOutline"}
          iconSet={getIconSet(result.icon || "IoLocationOutline")}
          size={20}
          color={getTypeColor(result.type)}
        />
      </Flex>

      {/* Content */}
      <Flex vertical style={{ flex: 1, minWidth: 0 }}>
        {/* Name and Type Tag */}
        <Flex
          align="center"
          justify="space-between"
          style={{ marginBottom: 4 }}
        >
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
          <Tag
            style={{
              margin: 0,
              fontSize: FONT_SIZE.SUB_TEXT,
              borderColor: getTypeColor(result.type),
              color: getTypeColor(result.type),
              backgroundColor: "transparent",
              flexShrink: 0,
            }}
          >
            {getTypeLabel(result.type)}
          </Tag>
        </Flex>

        {/* Description */}
        {(result.description || result.address) && (
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.SUB_TEXT,
              color: COLORS.textColorLight,
              lineHeight: 1.3,
            }}
            ellipsis={{ tooltip: result.address || result.description }}
          >
            {result.address || result.description}
          </Typography.Text>
        )}
      </Flex>
    </Flex>
  );
};
