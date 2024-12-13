import { IconLoader } from "@tabler/icons-react";
import { Box } from "@mantine/core";

const LoadingSpinner = ({ size = 24, color = "currentColor" }) => (
  <Box
    component={IconLoader}
    size={size}
    color={color}
    style={{ animation: "spin 1s linear infinite" }}
  />
);

const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <Box pos="relative">
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <LoadingSpinner size={48} />
      </Box>
      <Box style={{ opacity: isLoading ? 0.6 : 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export { LoadingSpinner, LoadingOverlay };
