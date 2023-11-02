import { lazy } from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import DemoSnackBar from "./components/DemoSnackBar";

const InitWebAuthnCard = lazy(() => import("./features/initWebAuthn"));
const GetWebAuthnCard = lazy(() => import("./features/getWebAuthn"));
const CreateAACard = lazy(() => import("./features/createAA"));

const defaultTheme = createTheme();
export default function Dashboard() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
              OKX AA WebAuthn Demo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InitWebAuthnCard />
              </Grid>
              <Grid item xs={12}>
                <GetWebAuthnCard />
              </Grid>
              <Grid item xs={12}>
                <CreateAACard />
              </Grid>
            </Grid>
            <DemoSnackBar />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
