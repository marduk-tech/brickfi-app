"use client";

import { Flex, Typography } from "antd";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Brick360v2 } from "../components/brick-360/brick360-v2";
import { Loader } from "../components/common/loader";
import { NoProjectsFound } from "../components/common/no-projects-found";
import { RequestedProjectsList } from "../components/requested-projects-list";
import { UserProjects } from "../components/user-projects";
import { useUser } from "../hooks/use-user";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { Brick360v3 } from "@/components/brick-360/brick360-v3";

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
        "67f0f60f3ef53b74b67d12f5,67e83fe1a06e471b3d14b6b5,687b4d291541e1a0ecb321ca,687b401e8a68a0900797180b,67f0046ca58ac2b37e530f2b,6870af1904ec49de98b9b1fa,680736af3ff1a71676450fbb,68073ba59f670b1afc3f03f4",
      );
    } else if (collectionId === "yellow-line") {
      fetchLvnzyProjectsByIds(
        "6870af1904ec49de98b9b1fa,68930f117f715b3ee58ca9d5,6879e74423db3840fc951225",
      );
    } else {
      // Existing logic for regular users
      if (!user.savedLvnzyProjects || user.savedLvnzyProjects.length === 0) {
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
  }, [collectionId, user]);

  if (projectsLoading) {
    return (
      <Flex vertical align="center" style={{ marginTop: 72 }}>
        <Loader></Loader>
        <Typography.Text>Fetching Reports. Please wait ..</Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex vertical>
      {lvnzyProjectId ? (
        <Brick360v2 slug={lvnzyProjectId} />
      ) : (
        <>
          {lvnzyProjects && lvnzyProjects.length ? (
            <UserProjects lvnzyProjects={lvnzyProjects} />
          ) : (
            <NoProjectsFound />
          )}
        </>
      )}
    </Flex>
  );
};

export default BrickfiHome;
