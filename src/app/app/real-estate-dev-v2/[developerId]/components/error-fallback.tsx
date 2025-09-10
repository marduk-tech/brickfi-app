import { COLORS, MAX_WIDTH } from "@/theme/style-constants";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorFallback({ 
  title = "Something went wrong",
  message = "Please try again later.",
  type = 'error'
}: ErrorFallbackProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fff7e6',
          borderColor: '#ffa940',
          iconColor: '#fa8c16',
          titleColor: '#d46b08'
        };
      case 'info':
        return {
          backgroundColor: '#e6f7ff',
          borderColor: '#40a9ff',
          iconColor: '#1890ff',
          titleColor: '#096dd9'
        };
      default:
        return {
          backgroundColor: '#fff2f0',
          borderColor: '#ff7875',
          iconColor: '#ff4d4f',
          titleColor: '#cf1322'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div style={{ 
      maxWidth: MAX_WIDTH, 
      margin: "auto",
      padding: "16px"
    }}>
      <div style={{
        padding: "16px",
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        {/* Icon */}
        <div style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: styles.iconColor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          flexShrink: 0
        }}>
          {type === 'warning' ? '!' : type === 'info' ? 'i' : '×'}
        </div>
        
        {/* Content */}
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: styles.titleColor,
            marginBottom: "4px"
          }}>
            {title}
          </div>
          <div style={{
            fontSize: "14px",
            color: "#666",
            lineHeight: "1.5"
          }}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}