"use client";

import {
  MarketingProject,
  useMarketingProjectSearch,
} from "@/hooks/use-marketing-project-search";
import { COLORS } from "@/theme/style-constants";
import { SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";

export default function Brk360sClient() {
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const { projects, isLoading } = useMarketingProjectSearch();

  const filteredProjects = useMemo(() => {

    const filteredProjects = projects.filter(p => !!p.lvnzyProjectId);
    if (!filteredProjects) return [];
    if (!searchText.trim()) return filteredProjects;

    return filteredProjects.filter((project) =>
      project.projectName?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [projects, searchText]);

  const columns: ColumnsType<MarketingProject> = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (name: string, record: MarketingProject) => {
        if (!record.lvnzyProjectId) {
          return <span>{name || "Unnamed Project"}</span>;
        }
        const url = `/app/brick360/${record.slug || record.lvnzyProjectId}`;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.primaryColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {name || "Unnamed Project"}
          </a>
        );
      },
    },
  ];

  return (
    <AdminGuard>
      <Flex vertical gap={16} style={{ padding: 24 }}>
        <Typography.Title level={3}>Brick360 Reports</Typography.Title>

        <Input
          placeholder="Search by project name..."
          prefix={<SearchOutlined style={{ color: COLORS.textColorMedium }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />

        <Table
          dataSource={filteredProjects}
          columns={columns}
          rowKey={(record) => record.lvnzyProjectId || record.projectName}
          loading={isLoading}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onShowSizeChange: (_, size) => setPageSize(size),
            showTotal: (total) => `Total ${total} projects`,
          }}
        />
      </Flex>
    </AdminGuard>
  );
}
