"use client";

import { Button, Flex, Typography } from "antd";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Brick360v2 } from "../components/brick-360/brick360-v2";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { Loader } from "../components/common/loader";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { UserProjects } from "../components/user-projects";
import { useFetchAllLvnzyProjects } from "../hooks/use-lvnzy-project";
import { useUser } from "../hooks/use-user";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LandingConstants } from "../libs/constants";
import { safeWindow } from "../libs/browser-utils";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { Brick360v3 } from "@/components/brick-360/brick360-v3";
import Link from "next/link";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading, refetch: refetchUser } = useUser();
  const { lvnzyProjectId, collectionId } = useParams<{
    lvnzyProjectId: string;
    collectionId: string;
  }>()!;

  const [lvnzyProjects, setLvnzyProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const { data: allLvnzyProjects, isLoading: adminProjectsLoading } =
    useFetchAllLvnzyProjects(isAdmin);

  const fetchLvnzyProjectsByIds = async (ids: string) => {
    const { data } = await axiosApiInstance.post(`/lvnzy-projects/${ids}`, {
      ids,
    });
    setLvnzyProjects(data);
    setProjectsLoading(false);
  };
  useEffect(() => {
    if (collectionId == "inv-friendly") {
      const description =
        "Investory friendly properties with partial payment and free EMI schemes.";
      document.title = `Brickfi | Investory Friendly Properties`;
      [
        "name='description'",
        "property='og:description'",
        "property='twitter:description'",
      ].forEach((mQ) => {
        const meta = document.querySelector(`meta[${mQ}]`);
        meta?.setAttribute("content", description);
      });
    }
  }, [collectionId]);

  useEffect(() => {
    if (lvnzyProjectId) {
      setProjectsLoading(false);
      return;
    }
    if (userLoading) {
      return;
    }
    if (!user) {
      setProjectsLoading(false);
      return;
    }

    if (collectionId === "inv-friendly") {
      fetchLvnzyProjectsByIds(
        "67f0f60f3ef53b74b67d12f5,67e83fe1a06e471b3d14b6b5,687b4d291541e1a0ecb321ca,687b401e8a68a0900797180b,67f0046ca58ac2b37e530f2b,6870af1904ec49de98b9b1fa,680736af3ff1a71676450fbb,68073ba59f670b1afc3f03f4"
      );
    } else if (collectionId === "yellow-line") {
      fetchLvnzyProjectsByIds(
        "6870af1904ec49de98b9b1fa,68930f117f715b3ee58ca9d5,6879e74423db3840fc951225"
      );
    } else {
      // Check if user is admin and show all projects
      if (user.role === "admin") {
        if (allLvnzyProjects) {
          setLvnzyProjects(allLvnzyProjects);
        }
        setProjectsLoading(false);
      } else {
        // Existing logic for regular users
        if (collectionId) {
          const collection =
            user.savedLvnzyProjects.find(
              (c: SavedLvnzyProject) => c._id === collectionId
            ) || null;
          if (collection && collection.projects) {
            setLvnzyProjects(collection.projects);
          }
          setProjectsLoading(false);
        } else {
          if (
            !user.savedLvnzyProjects ||
            user.savedLvnzyProjects.length === 0
          ) {
            setLvnzyProjects([]);
            setTimeout(() => {
              refetchUser();
              setTimeout(() => {
                if (projectsLoading) {
                  setProjectsLoading(false);
                }
              }, 300);
            }, 4000);

            setProjectsLoading(true);
          } else {
            setLvnzyProjects(user.savedLvnzyProjects[0].projects);
            setProjectsLoading(false);
          }
        }
      }
    }
  }, [collectionId, user, allLvnzyProjects]);

  if (userLoading || projectsLoading || (isAdmin && adminProjectsLoading)) {
    return (
      <Flex vertical align="center" style={{ marginTop: 72 }}>
        <Loader></Loader>
        <Typography.Text>Fetching Reports. Please wait ..</Typography.Text>
      </Flex>
    );
  }

  const handleProjectSelect = (
    projectId: string,
    projectName: string,
    lvnzyProjectId: string | null
  ) => {
    // Handle project selection
    console.log("Selected project:", {
      projectId,
      projectName,
      lvnzyProjectId,
    });
    // You can add navigation or other logic here
  };

  return (
    <Flex vertical>
      {lvnzyProjectId ? (
        <Brick360v2 slug={lvnzyProjectId} />
      ) : (
        <>
          {/* <Flex style={{ padding: "16px 16px 8px 16px" }}>
            <ProjectSearch
              onSelect={handleProjectSelect}
              placeholder="Search for a project"
            />
          </Flex> */}
          {/* {user && <RequestedProjectsList user={user} />} */}
          {lvnzyProjects && lvnzyProjects.length ? (
            <UserProjects lvnzyProjects={lvnzyProjects} />
          ) : (
            <Flex
              vertical
              style={{ margin: 16, marginTop: 100 }}
              align="center"
            >
              <DynamicReactIcon
                size={60}
                iconName="TbHomeSearch"
                iconSet="tb"
                color={COLORS.textColorLight}
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  fontWeight: 500,
                  marginTop: 24,
                }}
              >
                No Reports Found
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.PARA,
                  textAlign: "center",
                  color: COLORS.textColorDark,
                }}
              >
                Click reload below if you recently requested reports
              </Typography.Text>

              <Button
                style={{ marginTop: 48, fontSize: FONT_SIZE.HEADING_3,padding: "0 16px" }}
                onClick={() => {
                  window.location.reload();
                }}
                size="small"
              >
                Reload Page
              </Button>

              <Flex gap={16} style={{ position: "absolute", bottom: 100, padding: 16 }}>
                <Link
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.textColorMedium,
                  }}
                  onClick={() => {
                    safeWindow.location.assign(
                      LandingConstants.genReportFormLink
                    );
                  }}
                  href={LandingConstants.genReportFormLink}
                >
                  Request Brick360 Report
                </Link>
                <Link
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.textColorMedium,
                  }}
                  href="https://api.whatsapp.com/send?phone=919901623170"
                >
                  Need help ?
                </Link>
              </Flex>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
