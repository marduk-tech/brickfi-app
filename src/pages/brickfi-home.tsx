import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Brick360v2 } from "../components/brick-360/brick360-v2";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { Loader } from "../components/common/loader";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { UserProjects } from "../components/user-projects";
import { useFetchAllLvnzyProjects } from "../hooks/use-lvnzy-project";
import { useUser } from "../hooks/use-user";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LandingConstants } from "../libs/constants";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

interface SavedLvnzyProject {
  _id: string;
  collectionName: string;
  projects: any[];
}

const BrickfiHome: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { lvnzyProjectId, collectionId } = useParams();

  const [lvnzyProjects, setLvnzyProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoadng] = useState(true);

  const isAdmin = user?.role === "admin";
  const { data: allLvnzyProjects, isLoading: adminProjectsLoading } =
    useFetchAllLvnzyProjects(isAdmin);

  const fetchLvnzyProjectsByIds = async (ids: string) => {
    const { data } = await axiosApiInstance.post(`/lvnzy-projects/${ids}`, {
      ids,
    });
    setLvnzyProjects(data);
    setProjectsLoadng(false);
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
      setProjectsLoadng(false);
      return;
    }
    if (userLoading) {
      return;
    }
    if (!user) {
      setProjectsLoadng(false);
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
        setProjectsLoadng(false);
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
        } else {
          if (
            !user.savedLvnzyProjects ||
            user.savedLvnzyProjects.length === 0
          ) {
            setLvnzyProjects([]);
          } else {
            setLvnzyProjects(user.savedLvnzyProjects[0].projects);
          }
        }
        setProjectsLoadng(false);
      }
    }
  }, [collectionId, user, allLvnzyProjects]);

  if (userLoading || projectsLoading || (isAdmin && adminProjectsLoading)) {
    return <Loader></Loader>;
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
        <Brick360v2 />
      ) : (
        <>
          {/* <Flex style={{ padding: "16px 16px 8px 16px" }}>
            <ProjectSearch
              onSelect={handleProjectSelect}
              placeholder="Search for a project"
            />
          </Flex> */}
          {user && <RequestedProjectsList user={user} />}
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
                No Projects Found
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  textAlign: "center",
                  color: COLORS.textColorLight,
                }}
              >
                There are no projects added to your account. Please request a
                report by clicking button below or shoot an email at
                support@brickfi.in for help.
              </Typography.Text>
              <Button
                style={{ marginTop: 48, fontSize: FONT_SIZE.HEADING_2 }}
                onClick={() => {
                  window.location.assign(LandingConstants.genReportFormLink);
                }}
              >
                Request New Report
              </Button>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
