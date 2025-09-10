import { COLORS, MAX_WIDTH } from "@/theme/style-constants";
import { Flex, Skeleton } from "antd";
import React from "react";

export default function RealEstateDeveloperLoading() {
  return (
    <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
      <Flex vertical style={{ padding: 16 }}>
        {/* Developer name skeleton */}
        <Skeleton 
          active 
          title={{ width: 300 }}
          paragraph={false}
          style={{ marginBottom: 16 }}
        />
        
        {/* One-liner description skeleton */}
        <Skeleton 
          active 
          paragraph={{ rows: 2 }}
          title={false}
          style={{ marginBottom: 24 }}
        />

        {/* Tabs skeleton */}
        <div style={{ marginBottom: 16 }}>
          <Flex gap={24}>
            <Skeleton 
              active 
              title={{ width: 80 }}
              paragraph={false}
            />
            <Skeleton 
              active 
              title={{ width: 100 }}
              paragraph={false}
            />
            <Skeleton 
              active 
              title={{ width: 90 }}
              paragraph={false}
            />
          </Flex>
        </div>

        {/* Projects grid skeleton */}
        <Flex
          style={{
            width: "100%",
            flexWrap: "wrap",
          }}
          gap={16}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "250px",
                minWidth: "250px",
                border: `1px solid ${COLORS.borderColorMedium}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <Skeleton 
                active 
                title={{ width: "70%" }}
                paragraph={{ rows: 2, width: ["90%", "60%"] }}
              />
            </div>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}