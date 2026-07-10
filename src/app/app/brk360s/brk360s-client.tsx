"use client";

import { useFetchAllLvnzyProjects } from "@/hooks/use-lvnzy-project";
import { LvnzyProject } from "@/types/LvnzyProject";
import { COLORS } from "@/theme/style-constants";
import { SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

export default function Brk360sClient() {
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const { data: projects = [], isLoading } = useFetchAllLvnzyProjects(
    true,
    true,
  );

  const filteredProjects = useMemo(() => {
    if (!searchText.trim()) return projects;
    return projects.filter((project) =>
      project.meta?.projectName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  }, [projects, searchText]);

  const columns: ColumnsType<LvnzyProject> = [
    {
      title: "Project Name",
      dataIndex: ["meta", "projectName"],
      key: "projectName",
      render: (name: string, record: LvnzyProject) => {
        const url = `/app/brick360/${record.slug}`;
        return (
          <Flex gap={12} align="center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.primaryColor }}
              onClick={(e) => e.stopPropagation()}
            >
              {name || "Unnamed Project"}
            </a>
            {record.scoreExists ? <DynamicReactIcon
              iconName="TbView360Number"
              iconSet="tb"
              size={18}
              color={COLORS.primaryColor}
            />: null}
            
          </Flex>
        );
      },
    },
  ];

  return (
    <AdminGuard allowedRoles={["analyst", "admin"]}>
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
          rowKey={(record) => record.slug || record._id}
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
