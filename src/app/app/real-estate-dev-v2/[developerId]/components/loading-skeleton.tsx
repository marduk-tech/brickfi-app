import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";

interface LoadingSkeletonProps {
  showHeader?: boolean;
  contentRows?: number;
}

export function LoadingSkeleton({ 
  showHeader = true, 
  contentRows = 4 
}: LoadingSkeletonProps) {
  const skeletonStyle = {
    background: `linear-gradient(
      90deg,
      ${COLORS.borderColorMedium} 25%,
      #f0f0f0 50%,
      ${COLORS.borderColorMedium} 75%
    )`,
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `
      }} />
      <div style={{ 
        maxWidth: MAX_WIDTH, 
        margin: "auto",
        padding: "16px"
      }}>
        {showHeader && (
          <div style={{ marginBottom: "16px" }}>
            {/* Title skeleton */}
            <div 
              style={{
                ...skeletonStyle,
                height: FONT_SIZE.HEADING_1,
                width: "60%",
                marginBottom: "8px"
              }}
            />
            {/* Subtitle skeleton */}
            <div 
              style={{
                ...skeletonStyle,
                height: "16px",
                width: "80%",
                marginBottom: "24px"
              }}
            />
          </div>
        )}
        
        {/* Content skeleton */}
        <div>
          {Array.from({ length: contentRows }).map((_, index) => (
            <div 
              key={index}
              style={{
                ...skeletonStyle,
                height: "16px",
                width: `${Math.random() * 30 + 60}%`,
                marginBottom: "12px"
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function ProjectsLoadingSkeleton() {
  const skeletonStyle = {
    background: `linear-gradient(
      90deg,
      ${COLORS.borderColorMedium} 25%,
      #f0f0f0 50%,
      ${COLORS.borderColorMedium} 75%
    )`,
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px'
  };

  return (
    <div style={{ 
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      gap: "16px"
    }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div 
          key={index}
          style={{
            width: "250px",
            border: `1px solid ${COLORS.borderColorMedium}`,
            borderRadius: "8px",
            padding: "8px"
          }}
        >
          <div 
            style={{
              ...skeletonStyle,
              height: FONT_SIZE.HEADING_2,
              width: "70%",
              marginBottom: "8px"
            }}
          />
          <div 
            style={{
              ...skeletonStyle,
              height: "14px",
              width: "90%",
              marginBottom: "6px"
            }}
          />
          <div 
            style={{
              ...skeletonStyle,
              height: "14px",
              width: "60%"
            }}
          />
        </div>
      ))}
    </div>
  );
}