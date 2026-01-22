"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import { useFetchAllLvnzyProjects } from "@/hooks/use-lvnzy-project";
import { LvnzyProject } from "@/types/LvnzyProject";
import { COLORS } from "@/theme/style-constants";
import { Input, Table, Typography, Flex } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState, useMemo } from "react";
import { SearchOutlined } from "@ant-design/icons";

export default function Brk360sClient() {
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const { data: projects, isLoading } = useFetchAllLvnzyProjects(true);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchText.trim()) return projects;

    return projects.filter((project) =>
      project.meta?.projectName
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [projects, searchText]);

  const columns: ColumnsType<LvnzyProject> = [
    {
      title: "Project Name",
      dataIndex: ["meta", "projectName"],
      key: "projectName",
      render: (name: string, record: LvnzyProject) => {
        const url = `/app/brick360/${record.slug || record._id}`;
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
          rowKey="_id"
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
