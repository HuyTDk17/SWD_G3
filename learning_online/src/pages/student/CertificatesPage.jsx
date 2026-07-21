import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Alert
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getMyCertificates } from "../../api/certificateApi";

function CertificatesPage() {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyCertificates();
        setCerts(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your certificates.");
      } finally {
        setLoading(false);
      }
    };
    loadCerts();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading certificates list...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/profile")}
        sx={{ mb: 3 }}
      >
        Back to Profile
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          My Certificates
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Review and print the qualifications you have successfully completed.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {certs.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
          <WorkspacePremiumIcon sx={{ fontSize: 70, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You haven't earned any certificates yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Complete all lessons and pass all quizzes in your enrolled courses to earn certifications!
          </Typography>
          <Button variant="contained" onClick={() => navigate("/my-courses")}>
            Continue Learning
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certs.map((cert) => (
            <Grid item xs={12} key={cert._id}>
              <Card sx={{ display: "flex", p: 2, borderRadius: 3, boxShadow: 2, borderLeft: "6px solid #d4af37" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyItems: "center", p: 2 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 50, color: "#d4af37" }} />
                </Box>
                <CardContent sx={{ flex: "1 0 auto" }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                    {cert.courseId?.title || "Language Course"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Language: {cert.courseId?.language} • CEFR: {cert.courseId?.cefrLevel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Verification Code: <strong>{cert.verificationCode}</strong> • Issued on: {new Date(cert.issuedAt).toLocaleDateString()}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(`/certificates/verify/${cert.verificationCode}`, "_blank")}
                      sx={{ borderRadius: 2 }}
                    >
                      Verify Authenticity
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default CertificatesPage;
