import React from "react";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";
import { useParams } from "react-router-dom";
import { Loader } from "../components/common/loader";

const containerStyle: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  padding: "1.5rem",
  borderRadius: "8px",
  marginBottom: "2rem",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  textTransform: "capitalize",
};

const subsectionStyle: React.CSSProperties = {
  marginBottom: "1.25rem",
};

const ratingStyle: React.CSSProperties = {
  fontStyle: "italic",
  color: "#555",
};

const HtmlList = ({ title, items }: { title: string; items: string[] }) => (
  <div style={subsectionStyle}>
    <h4>{title}</h4>
    <ul>
      {items.map((html, idx) => (
        <li
          key={idx}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ marginBottom: "0.75rem" }}
        />
      ))}
    </ul>
  </div>
);

const RatingBlock = ({
  reasoning,
  rating,
  title,
}: {
  reasoning: string[];
  rating?: number;
  title?: string;
}) => (
  <div style={subsectionStyle}>
    {title && <h4>{title}</h4>}
    {typeof rating === "number" && (
      <p style={ratingStyle}>Rating: {rating}/100</p>
    )}
    {reasoning && (
      <ul className="reasoning">
        {reasoning.map((html, idx) => (
          <li
            key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ marginBottom: "0.75rem" }}
          />
        ))}
      </ul>
    )}
  </div>
);

export function Brick360Full() {
  const { lvnzyProjectId } = useParams();

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const sections = [
    {
      key: "summary",
      label: "Summary",
      content: (section: any) => (
        <>
          <HtmlList title="Pros" items={section.pros} />
          <HtmlList title="Cons" items={section.cons} />
        </>
      ),
    },
    {
      key: "property",
      label: "Property",
      content: (section: any) => (
        <>
          {Object.entries(section).map(([subKey, subSection]: any) =>
            subKey !== "_id" ? (
              <RatingBlock
                key={subKey}
                reasoning={subSection.reasoning}
                rating={subSection.rating}
                title={subKey}
              />
            ) : null
          )}
        </>
      ),
    },
    {
      key: "developer",
      label: "Developer",
      content: (section: any) => (
        <>
          {Object.entries(section).map(([subKey, subSection]: any) =>
            subKey !== "_id" ? (
              <RatingBlock
                key={subKey}
                reasoning={subSection.reasoning}
                rating={subSection.rating}
                title={subKey}
              />
            ) : null
          )}
        </>
      ),
    },
    {
      key: "areaConnectivity",
      label: "Area Connectivity",
      content: (section: any) => (
        <>
          {Object.entries(section).map(([subKey, subSection]: any) =>
            subKey !== "_id" ? (
              <RatingBlock
                key={subKey}
                reasoning={subSection.reasoning}
                rating={subSection.rating}
                title={subKey}
              />
            ) : null
          )}
        </>
      ),
    },
    {
      key: "financials",
      label: "Financials",
      content: (section: any) => (
        <>
          {Object.entries(section).map(([subKey, subSection]: any) =>
            subKey !== "_id" ? (
              <RatingBlock
                key={subKey}
                reasoning={subSection.reasoning}
                rating={subSection.rating}
                title={subKey}
              />
            ) : null
          )}
        </>
      ),
    },
  ];

  if (lvnzyProjectIsLoading || !lvnzyProject) {
    return <Loader></Loader>;
  }
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>{lvnzyProject.meta.projectName}</h1>
      <h3 style={{ margin: 0, marginBottom: 24 }}>
        {lvnzyProject.meta.oneLiner}
      </h3>
      {sections.map(({ key, label, content }) => {
        const sectionData = lvnzyProject["score"][key];
        if (!sectionData) return null;

        return (
          <div key={key} style={containerStyle}>
            <div style={sectionTitleStyle}>{label}</div>
            {content(sectionData)}
          </div>
        );
      })}
    </div>
  );
}
