import { LoadingButton } from "@mui/lab";

const CardActionButton = ({
  buttonText,
  onClick,
  disabled = false,
  testId = "",
  loading = false,
  sx,
}) => {
  return (
    <LoadingButton
      size="small"
      variant="contained"
      sx={{ ...sx, backgroundColor: "black", borderRadius: 2 }}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      loading={loading}
    >
      {buttonText}
    </LoadingButton>
  );
};

export { CardActionButton };
